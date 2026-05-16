using System.Net;
using System.Net.Http.Json;
using DreamTeamEver.Domain.Options;
using DreamTeamEver.Infrastructure.Auth.Models;
using DreamTeamEver.Infrastructure.Constants;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Infrastructure.Auth.GeoIp;

/// <summary>
/// Secondary geo client: GET <c>{ip}?fields=status,countryCode</c> when <see cref="Domain.Options.GeoIpOptions.FallbackBaseUrl"/> is set.
/// </summary>
internal sealed class IpApiGeoIpCountryCodeProvider : IGeoIpCountryCodeProvider
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly GeoIpOptions _options;

    public IpApiGeoIpCountryCodeProvider(IHttpClientFactory httpClientFactory, IOptions<GeoIpOptions> options)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
    }

    public async ValueTask<string?> TryGetCountryCodeAsync(IPAddress publicIp, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.FallbackBaseUrl))
        {
            return null;
        }

        var client = _httpClientFactory.CreateClient(GeoIpHttpClientNames.Fallback);
        var response = await client.GetFromJsonAsync<IpApiCountryResponse>($"{publicIp}?fields=status,countryCode", cancellationToken);
        
        if (response is null || !string.Equals(response.Status, "success", StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(response.CountryCode))
        {
            return null;
        }

        return response.CountryCode.Trim().ToUpperInvariant();
    }
}
