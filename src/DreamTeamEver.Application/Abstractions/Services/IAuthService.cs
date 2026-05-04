using DreamTeamEver.Application.Dtos;

namespace DreamTeamEver.Application.Abstractions;

public interface IAuthService
{
    Task<AuthResponse?> SignUpAsync(SignUpRequest request, CancellationToken cancellationToken = default);

    Task<AuthResponse?> SignInAsync(SignInRequest request, CancellationToken cancellationToken = default);

    Task<AuthResponse?> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);

    /// <summary>Invalidate access token (Redis) and revoke refresh tokens for the user.</summary>
    Task SignOutAsync(Guid userId, string accessTokenJti, DateTimeOffset accessExpiresAtUtc, CancellationToken cancellationToken = default);

    /// <summary>Stores a password-reset token for the user (integrate email delivery separately).</summary>
    Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);

    Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
}
