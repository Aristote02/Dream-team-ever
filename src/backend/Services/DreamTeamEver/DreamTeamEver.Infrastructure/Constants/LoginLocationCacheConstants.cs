namespace DreamTeamEver.Infrastructure.Constants;

internal static class LoginLocationCacheConstants
{
    public const string KeyPrefix = "login-loc:";

    /// <summary>Each cached country entry counts as one unit toward <see cref="Domain.Options.GeoIpOptions.CacheSizeLimit"/>.</summary>
    public const int EntrySize = 1;

    public const double CompactionPercentage = 0.3;

    public static readonly TimeSpan ExpirationScanFrequency = TimeSpan.FromMinutes(5);

    /// <summary>Hex characters taken from the SHA-256 digest for cache keys (low collision risk).</summary>
    public const int CacheKeyHashHexLength = 16;
}
