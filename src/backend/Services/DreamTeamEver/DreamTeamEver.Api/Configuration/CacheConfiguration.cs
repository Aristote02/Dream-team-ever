using DreamTeamEver.Infrastructure;

namespace DreamTeamEver.Api.Configuration;

/// <summary>
/// Application entry for distributed cache + token blacklist. Delegates to Infrastructure (Redis with in-memory fallback).
/// </summary>
public static class CacheConfiguration
{
    public static IServiceCollection ConfigureCache(this IServiceCollection services, IConfiguration configuration) =>
        services.AddDreamTeamEverCachingAndTokenBlacklistWithFallback(configuration);
}
