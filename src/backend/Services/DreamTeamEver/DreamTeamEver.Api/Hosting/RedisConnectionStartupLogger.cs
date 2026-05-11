using DreamTeamEver.Infrastructure;
using StackExchange.Redis;

namespace DreamTeamEver.Api.Hosting;

/// <summary>
/// Logs once at startup whether Redis is active or the app fell back to in-memory cache / token blacklist.
/// </summary>
public sealed class RedisConnectionStartupLogger : IHostedService
{
    private readonly IServiceProvider _services;
    private readonly IConfiguration _configuration;
    private readonly ILogger<RedisConnectionStartupLogger> _logger;

    public RedisConnectionStartupLogger(
        IServiceProvider services,
        IConfiguration configuration,
        ILogger<RedisConnectionStartupLogger> logger)
    {
        _services = services;
        _configuration = configuration;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        var configured = RedisConnectionStringResolver.Resolve(_configuration);
        var mux = _services.GetService<IConnectionMultiplexer>();

        if (mux is not null)
        {
            _logger.LogInformation(
                "Redis is active for distributed cache and JWT access-token blacklist.");
            return Task.CompletedTask;
        }

        if (string.IsNullOrWhiteSpace(configured))
        {
            _logger.LogInformation(
                "Redis is not configured (set ConnectionStrings__RedisConnectionString or REDIS_URL). Using in-memory distributed cache and token blacklist.");
            return Task.CompletedTask;
        }

        _logger.LogWarning(
            "Redis connection string is set but the server was unreachable at startup; using in-memory distributed cache and token blacklist. Check REDIS_URL / ConnectionStrings:RedisConnectionString and private networking.");
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
