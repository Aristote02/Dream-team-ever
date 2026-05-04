using DreamTeamEver.Application.Abstractions;
using Microsoft.Extensions.Caching.Memory;

namespace DreamTeamEver.Infrastructure.Services;

/// <summary>In-process JWT jti blacklist used when Redis is unavailable.</summary>
public sealed class MemoryTokenBlacklistService : ITokenBlacklistService
{
    private readonly IMemoryCache _cache;

    public MemoryTokenBlacklistService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task BlacklistAccessTokenAsync(string jti, DateTimeOffset accessTokenExpiresAtUtc, CancellationToken cancellationToken = default)
    {
        var ttl = accessTokenExpiresAtUtc - DateTimeOffset.UtcNow;
        if (ttl <= TimeSpan.Zero)
            return Task.CompletedTask;

        _cache.Set(CacheKey(jti), true, new MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl });
        return Task.CompletedTask;
    }

    public Task<bool> IsAccessTokenBlacklistedAsync(string jti, CancellationToken cancellationToken = default) =>
        Task.FromResult(_cache.TryGetValue(CacheKey(jti), out _));

    private static string CacheKey(string jti) => $"dfe:jwt:blk:{jti}";
}
