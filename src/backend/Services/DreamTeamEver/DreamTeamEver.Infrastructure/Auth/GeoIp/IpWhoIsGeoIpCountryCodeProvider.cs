using System.Net;
using System.Net.Http.Json;
using DreamTeamEver.Infrastructure.Auth.Models;
using DreamTeamEver.Infrastructure.Constants;

namespace DreamTeamEver.Infrastructure.Auth.GeoIp;

/// <summary>
/// Primary geo client: GET <c>{ip}</c> against <see cref="Domain.Options.GeoIpOptions.PrimaryBaseUrl"/> (ipwho.is).
/// </summary>
internal sealed class IpWhoIsGeoIpCountryCodeProvider : IGeoIpCountryCodeProvider
{
    private readonly IHttpClientFactory _httpClientFactory;

    public IpWhoIsGeoIpCountryCodeProvider(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async ValueTask<string?> TryGetCountryCodeAsync(IPAddress publicIp, CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient(GeoIpHttpClientNames.Primary);
        var response = await client.GetFromJsonAsync<IpWhoIsCountryResponse>(publicIp.ToString(), cancellationToken);
        if (response is null)
        {
            return null;
        }

        if (!response.Success || string.IsNullOrWhiteSpace(response.CountryCode))
        {
            return null;
        }

        return response.CountryCode.Trim().ToUpperInvariant();
    }
}
