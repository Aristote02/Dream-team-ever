namespace DreamTeamEver.Infrastructure.Auth.Caching;

/// <summary>IP-hash → location key store (implementation is a dedicated bounded <see cref="Microsoft.Extensions.Caching.Memory.MemoryCache"/>).</summary>
internal interface ILoginLocationCache
{
    bool TryGet(string cacheKey, out string? locationKey);

    void Set(string cacheKey, string locationKey, TimeSpan ttl);
}
