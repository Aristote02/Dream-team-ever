using System.Net;
using System.Security.Cryptography;
using DreamTeamEver.Infrastructure.Constants;

namespace DreamTeamEver.Infrastructure.Auth.Networking;

/// <summary>
/// SHA-256-derived cache keys and log fingerprints so raw IPs are not stored in memory or logs.
/// </summary>
internal static class ClientAddressHash
{
    /// <summary>
    /// Cache entry key: <c>login-loc:</c> + first 16 hex chars of SHA-256(address bytes)
    /// </summary>
    public static string BuildCacheKey(IPAddress ip)
    {
        var digest = SHA256.HashData(ip.GetAddressBytes());
        var hex = Convert.ToHexString(digest.AsSpan(0, LoginLocationCacheConstants.CacheKeyHashHexLength));
        
        return $"{LoginLocationCacheConstants.KeyPrefix}{hex}";
    }

    /// <summary>
    /// Stable fingerprint for logs without recording the raw IP (GDPR).
    /// </summary>
    public static int GetLoggingFingerprint(IPAddress ip)
    {
        var digest = SHA256.HashData(ip.GetAddressBytes());
        
        return BitConverter.ToInt32(digest, 0);
    }
}
