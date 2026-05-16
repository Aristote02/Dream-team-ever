using System.Net;

namespace DreamTeamEver.Infrastructure.Auth.GeoIp;

/// <summary>
/// Looks up an ISO 3166-1 alpha-2 country code for a public routable IP.
/// Returns <see langword="null"/> when lookup fails.
/// </summary>
internal interface IGeoIpCountryCodeProvider
{
    ValueTask<string?> TryGetCountryCodeAsync(IPAddress publicIp, CancellationToken cancellationToken);
}
