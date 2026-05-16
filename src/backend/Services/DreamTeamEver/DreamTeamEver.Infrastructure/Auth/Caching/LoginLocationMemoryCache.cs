using DreamTeamEver.Domain.Options;
using DreamTeamEver.Infrastructure.Constants;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Infrastructure.Auth.Caching;

/// <summary>Bounded in-memory cache for IP-to-country lookups (isolated from the global <see cref="IMemoryCache"/>).</summary>
internal sealed class LoginLocationMemoryCache : ILoginLocationCache, IDisposable
{
    private readonly MemoryCache _cache;

    public LoginLocationMemoryCache(IOptions<GeoIpOptions> options)
    {
        var sizeLimit = Math.Max(100, options.Value.CacheSizeLimit);
        _cache = new MemoryCache(new MemoryCacheOptions
        {
            SizeLimit = sizeLimit,
            CompactionPercentage = LoginLocationCacheConstants.CompactionPercentage,
            ExpirationScanFrequency = LoginLocationCacheConstants.ExpirationScanFrequency,
        });
    }

    public bool TryGet(string cacheKey, out string? locationKey) =>
        _cache.TryGetValue(cacheKey, out locationKey);

    public void Set(string cacheKey, string locationKey, TimeSpan ttl)
    {
        _cache.Set(cacheKey, locationKey, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = ttl,
            Size = LoginLocationCacheConstants.EntrySize,
            Priority = CacheItemPriority.Normal
        });
    }

    public void Dispose() => _cache.Dispose();
}
