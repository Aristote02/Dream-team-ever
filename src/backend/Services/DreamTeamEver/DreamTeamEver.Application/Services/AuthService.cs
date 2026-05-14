using System.Security.Cryptography;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Application.Security;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using DreamTeamEver.Domain.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Application.Services;

public sealed class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IMemberRepository _members;
    private readonly IRefreshTokenRepository _refreshTokens;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IJwtTokenGenerator _jwt;
    private readonly ITokenBlacklistService _blacklist;
    private readonly IRequestContextAccessor _requestContextAccessor;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly JwtOptions _jwtOptions;
    private readonly ILogger<AuthService> _logger;
    private readonly IHostEnvironment _env;

    public AuthService(
        IUserRepository users,
        IMemberRepository members,
        IRefreshTokenRepository refreshTokens,
        IPasswordHasher<User> passwordHasher,
        IJwtTokenGenerator jwt,
        ITokenBlacklistService blacklist,
        IRequestContextAccessor requestContextAccessor,
        IServiceScopeFactory scopeFactory,
        IOptions<JwtOptions> jwtOptions,
        ILogger<AuthService> logger,
        IHostEnvironment env)
    {
        _users = users;
        _members = members;
        _refreshTokens = refreshTokens;
        _passwordHasher = passwordHasher;
        _jwt = jwt;
        _blacklist = blacklist;
        _requestContextAccessor = requestContextAccessor;
        _scopeFactory = scopeFactory;
        _jwtOptions = jwtOptions.Value;
        _logger = logger;
        _env = env;
    }

    public async Task<AuthResponse?> SignUpAsync(SignUpRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim();
        if (await _users.ExistsByEmailAsync(email, cancellationToken))
        {
            return null;
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Role = UserRole.Member,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        await _users.AddAsync(user, cancellationToken);

        var member = new Member
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            FullName = request.FullName.Trim(),
            Phone = request.Phone.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await _members.AddAsync(member, cancellationToken);
        await _users.SaveChangesAsync(cancellationToken);

        var authResponse = await IssueTokensAsync(user, member, cancellationToken);
        await SendWelcomeEmailAfterSignUpAsync(user.Email, member.FullName, cancellationToken);
        
        return authResponse;
    }

    public async Task<AuthResponse?> SignInAsync(SignInRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim();
        var user = await _users.GetByEmailWithMemberProfileAsync(email, cancellationToken);

        if (user is null)
        {
            return null;
        }

        var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var authResponse = await IssueTokensAsync(user, user.MemberProfile, cancellationToken);
        QueueLoginAlertEmail(user, user.MemberProfile);

        return authResponse;
    }

    public async Task<AuthResponse?> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var hash = TokenCrypto.Hash(request.RefreshToken);
        var existing = await _refreshTokens.FindActiveByTokenHashWithUserAsync(hash, cancellationToken);

        if (existing is null)
        {
            return null;
        }

        existing.RevokedAtUtc = DateTimeOffset.UtcNow;
        await _refreshTokens.SaveChangesAsync(cancellationToken);

        return await IssueTokensAsync(existing.User, existing.User.MemberProfile, cancellationToken);
    }

    public async Task SignOutAsync(Guid userId, string accessTokenJti, DateTimeOffset accessExpiresAtUtc, CancellationToken cancellationToken = default)
    {
        await _blacklist.BlacklistAccessTokenAsync(accessTokenJti, accessExpiresAtUtc, cancellationToken);

        var tokens = await _refreshTokens.ListActiveByUserIdAsync(userId, cancellationToken);
        foreach (var t in tokens)
        {
            t.RevokedAtUtc = DateTimeOffset.UtcNow;
        }

        await _refreshTokens.SaveChangesAsync(cancellationToken);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim();
        var user = await _users.GetByEmailTrackedAsync(email, cancellationToken);
        if (user is null)
        {
            return;
        }

        var plain = TokenCrypto.GenerateOpaqueToken();
        user.PasswordResetTokenHash = TokenCrypto.Hash(plain);
        user.PasswordResetExpiresAt = DateTimeOffset.UtcNow.AddHours(1);
        await _users.SaveChangesAsync(cancellationToken);

        QueuePasswordResetEmail(user.Email, user.MemberProfile?.FullName, plain, user.PasswordResetExpiresAt.Value);

        if (_env.IsDevelopment())
        {
            _logger.LogWarning(
                "Password reset token for {Email} (dev only — replace with email delivery): {Token}",
                email,
                plain);
        }
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim();
        var user = await _users.GetByEmailTrackedAsync(email, cancellationToken);
        if (user is null || user.PasswordResetTokenHash is null || user.PasswordResetExpiresAt is null)
        {
            return false;
        }

        if (user.PasswordResetExpiresAt < DateTimeOffset.UtcNow)
        {
            return false;
        }

        var computedHash = TokenCrypto.Hash(request.Token);
        if (!FixedTimeHexEquals(user.PasswordResetTokenHash, computedHash))
        {
            return false;
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetExpiresAt = null;

        var refreshTokens = await _refreshTokens.ListActiveByUserIdAsync(user.Id, cancellationToken);
        foreach (var t in refreshTokens)
        {
            t.RevokedAtUtc = DateTimeOffset.UtcNow;
        }

        await _users.SaveChangesAsync(cancellationToken);
        QueuePasswordChangedEmail(user.Email, user.MemberProfile?.FullName);
        return true;
    }

    private async Task<AuthResponse> IssueTokensAsync(User user, Member? member, CancellationToken cancellationToken)
    {
        var (access, accessExp, _) = _jwt.CreateAccessToken(user, member?.Id);
        var refreshPlain = TokenCrypto.GenerateOpaqueToken();
        var refreshHash = TokenCrypto.Hash(refreshPlain);
        var refreshExp = DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenDays);

        await _refreshTokens.AddAsync(
            new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = refreshHash,
                ExpiresAtUtc = refreshExp,
                CreatedAtUtc = DateTimeOffset.UtcNow,
            },
            cancellationToken);

        await _refreshTokens.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            access,
            accessExp,
            refreshPlain,
            refreshExp,
            user.Email,
            user.Role.ToString(),
            user.Id,
            member?.Id,
            member?.Phone,
            member?.MatriculeCode);
    }

    private void QueueLoginAlertEmail(User user, Member? member)
    {
        var ctx = _requestContextAccessor.GetCurrent();
        var ip = string.IsNullOrWhiteSpace(ctx.IpAddress) ? "Unknown" : ctx.IpAddress;
        var ua = string.IsNullOrWhiteSpace(ctx.UserAgent) ? "Unknown" : ctx.UserAgent;
        _ = Task.Run(() => SendLoginAlertEmailInBackgroundAsync(user.Email, member?.FullName, ip, ua));
    }

    private void QueuePasswordResetEmail(string recipientEmail, string? recipientName, string plainToken, DateTimeOffset expiresAtUtc) =>
        _ = Task.Run(() => SendPasswordResetEmailInBackgroundAsync(recipientEmail, recipientName, plainToken, expiresAtUtc));

    private void QueuePasswordChangedEmail(string recipientEmail, string? recipientName) =>
        _ = Task.Run(() => SendPasswordChangedEmailInBackgroundAsync(recipientEmail, recipientName));

    private async Task SendWelcomeEmailAfterSignUpAsync(string recipientEmail, string? recipientName, CancellationToken cancellationToken)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var emailEnabled = scope.ServiceProvider.GetRequiredService<IOptions<EmailNotificationOptions>>().Value.Enabled;
            var emails = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();
            await emails.SendWelcomeAsync(new WelcomeNotification(recipientEmail, recipientName), cancellationToken);
            
            if (!emailEnabled)
            {
                _logger.LogInformation("Welcome email skipped: Email:Enabled is false for {Email}.", recipientEmail);
                return;
            }

            _logger.LogInformation("Welcome email sent to {Email}.", recipientEmail);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Welcome email failed for {Email}.", recipientEmail);
        }
    }

    private async Task SendLoginAlertEmailInBackgroundAsync(string recipientEmail, string? recipientName, string ipAddress, string userAgent)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var emailEnabled = scope.ServiceProvider.GetRequiredService<IOptions<EmailNotificationOptions>>().Value.Enabled;
            var emails = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();
            var notification = new LoginAlertNotification(recipientEmail, recipientName, ipAddress, userAgent, DateTimeOffset.UtcNow);
            
            await emails.SendLoginAlertAsync(notification, CancellationToken.None);
            
            if (!emailEnabled)
            {
                _logger.LogInformation("Login alert email skipped: Email:Enabled is false for {Email}.", recipientEmail);
                
                return;
            }

            _logger.LogInformation("Login alert email sent (background) to {Email}.", recipientEmail);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Login alert email failed for {Email}.", recipientEmail);
        }
    }

    private async Task SendPasswordResetEmailInBackgroundAsync(
        string recipientEmail,
        string? recipientName,
        string plainToken,
        DateTimeOffset expiresAtUtc)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var emailEnabled = scope.ServiceProvider.GetRequiredService<IOptions<EmailNotificationOptions>>().Value.Enabled;
            var emails = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();
            await emails.SendPasswordResetAsync(new PasswordResetNotification(recipientEmail, recipientName, plainToken, expiresAtUtc), CancellationToken.None);
            
            if (!emailEnabled)
            {
                _logger.LogInformation("Password reset email skipped: Email:Enabled is false for {Email}.", recipientEmail);
                
                return;
            }

            _logger.LogInformation("Password reset email sent (background) to {Email}.", recipientEmail);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Password reset email failed for {Email}.", recipientEmail);
        }
    }

    private async Task SendPasswordChangedEmailInBackgroundAsync(string recipientEmail, string? recipientName)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var emailEnabled = scope.ServiceProvider.GetRequiredService<IOptions<EmailNotificationOptions>>().Value.Enabled;
            var emails = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();
            await emails.SendPasswordChangedAsync(new PasswordChangedNotification(recipientEmail, recipientName, DateTimeOffset.UtcNow), CancellationToken.None);
            
            if (!emailEnabled)
            {
                _logger.LogInformation("Password changed email skipped: Email:Enabled is false for {Email}.", recipientEmail);
                
                return;
            }

            _logger.LogInformation("Password changed email sent (background) to {Email}.", recipientEmail);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Password changed email failed for {Email}.", recipientEmail);
        }
    }

    private static bool FixedTimeHexEquals(string aHex, string bHex)
    {
        try
        {
            var a = Convert.FromHexString(aHex);
            var b = Convert.FromHexString(bHex);
            return CryptographicOperations.FixedTimeEquals(a, b);
        }
        catch
        {
            return false;
        }
    }
}
