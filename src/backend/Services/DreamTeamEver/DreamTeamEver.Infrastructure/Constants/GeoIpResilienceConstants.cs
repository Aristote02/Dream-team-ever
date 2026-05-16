namespace DreamTeamEver.Infrastructure.Constants;

/// <summary>Polly retry and circuit-breaker thresholds for geo HTTP clients (see <see cref="Auth.GeoIpServiceCollectionExtensions"/>).</summary>
internal static class GeoIpResilienceConstants
{
    public const int RetryCount = 3;

    public const int CircuitBreakerFailureThreshold = 5;

    public static readonly TimeSpan CircuitBreakerBreakDuration = TimeSpan.FromSeconds(30);
}
