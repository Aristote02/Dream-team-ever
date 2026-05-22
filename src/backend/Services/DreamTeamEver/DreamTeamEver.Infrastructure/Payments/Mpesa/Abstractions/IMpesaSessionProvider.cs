namespace DreamTeamEver.Infrastructure.Payments.Mpesa.Abstractions;

internal interface IMpesaSessionProvider
{
    Task<string> GetSessionIdAsync(CancellationToken cancellationToken);
}
