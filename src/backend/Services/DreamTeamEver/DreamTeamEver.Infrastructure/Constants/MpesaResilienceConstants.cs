namespace DreamTeamEver.Infrastructure.Constants;

/// <summary>Polly thresholds for M-Pesa Open API HTTP client (see <see cref="Payments.Mpesa.MpesaServiceCollectionExtensions"/>).</summary>
internal static class MpesaResilienceConstants
{
    public const int RetryCount = 2;

    public const int CircuitBreakerFailureThreshold = 5;

    public static readonly TimeSpan CircuitBreakerBreakDuration = TimeSpan.FromSeconds(60);
}
