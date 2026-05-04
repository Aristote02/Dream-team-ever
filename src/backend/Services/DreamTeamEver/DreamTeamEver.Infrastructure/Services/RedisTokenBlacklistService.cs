using DreamTeamEver.Application.Abstractions;
using StackExchange.Redis;

namespace DreamTeamEver.Infrastructure.Services;

public sealed class RedisTokenBlacklistService : ITokenBlacklistService
{
    private readonly IConnectionMultiplexer _redis;

    public RedisTokenBlacklistService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task BlacklistAccessTokenAsync(string jti, DateTimeOffset accessTokenExpiresAtUtc, CancellationToken cancellationToken = default)
    {
        var ttl = accessTokenExpiresAtUtc - DateTimeOffset.UtcNow;
        if (ttl <= TimeSpan.Zero)
            return;

        var db = _redis.GetDatabase();
        var key = BlacklistKey(jti);
        await db.StringSetAsync(key, "1", ttl);
    }

    public async Task<bool> IsAccessTokenBlacklistedAsync(string jti, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        return await db.KeyExistsAsync(BlacklistKey(jti));
    }

    private static RedisKey BlacklistKey(string jti) => $"dfe:jwt:blk:{jti}";
}
