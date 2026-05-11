using DreamTeamEver.Domain.Options;
using Microsoft.Extensions.Configuration;

namespace DreamTeamEver.Infrastructure;

public static class RedisConnectionStringResolver
{
    /// <summary>
    /// Resolves Redis connection string from ConnectionStrings:RedisConnectionString or REDIS_URL .
    /// </summary>
    public static string? Resolve(IConfiguration configuration)
    {
        var fromSection = configuration
            .GetSection(ConnectionStringsOptions.SectionName)
            .Get<ConnectionStringsOptions>()
            ?.RedisConnectionString?
            .Trim();

        if (!string.IsNullOrWhiteSpace(fromSection))
        {
            return fromSection;
        }

        return configuration["REDIS_URL"]?.Trim();
    }
}
