using System.Security.Cryptography;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Application.Security;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using Microsoft.AspNetCore.Identity;
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

        return await IssueTokensAsync(user, member, cancellationToken);
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

        return await IssueTokensAsync(user, user.MemberProfile, cancellationToken);
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
