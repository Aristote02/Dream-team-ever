namespace DreamTeamEver.Application.Abstractions;

/// <summary>Redis-backed blacklist for revoked access tokens (JWT jti).</summary>
public interface ITokenBlacklistService
{
    Task BlacklistAccessTokenAsync(string jti, DateTimeOffset accessTokenExpiresAtUtc, CancellationToken cancellationToken = default);

    Task<bool> IsAccessTokenBlacklistedAsync(string jti, CancellationToken cancellationToken = default);
}
