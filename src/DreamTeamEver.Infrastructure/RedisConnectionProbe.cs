using StackExchange.Redis;

namespace DreamTeamEver.Infrastructure;

/// <summary>Fast-fail Redis probe so we can fall back to in-memory cache when Redis is down.</summary>
internal static class RedisConnectionProbe
{
    internal static bool TryConnect(string connectionString, out IConnectionMultiplexer? multiplexer)
    {
        multiplexer = null;
        try
        {
            var options = ConfigurationOptions.Parse(connectionString);
            options.AbortOnConnectFail = true;
            options.ConnectTimeout = 3000;
            var mux = ConnectionMultiplexer.Connect(options);
            multiplexer = mux;
            return true;
        }
        catch
        {
            multiplexer?.Dispose();
            multiplexer = null;
            return false;
        }
    }
}
