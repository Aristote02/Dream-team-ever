using System.Net;
using Microsoft.Extensions.Logging;

namespace DreamTeamEver.Infrastructure.Auth.GeoIp;

/// <summary>
/// ipwho is first; on empty result or HTTP timeout/error, calls ip-api.
/// The fallback provider returns immediately when <see cref="Domain.Options.GeoIpOptions.FallbackBaseUrl"/> is unset.
/// </summary>
internal sealed class ChainedGeoIpCountryCodeProvider : IGeoIpCountryCodeProvider
{
    private readonly IpWhoIsGeoIpCountryCodeProvider _primary;
    private readonly IpApiGeoIpCountryCodeProvider _fallback;
    private readonly ILogger<ChainedGeoIpCountryCodeProvider> _logger;

    public ChainedGeoIpCountryCodeProvider(IpWhoIsGeoIpCountryCodeProvider primary, IpApiGeoIpCountryCodeProvider fallback, ILogger<ChainedGeoIpCountryCodeProvider> logger)
    {
        _primary = primary;
        _fallback = fallback;
        _logger = logger;
    }

    public async ValueTask<string?> TryGetCountryCodeAsync(IPAddress publicIp, CancellationToken cancellationToken)
    {
        try
        {
            var primary = await _primary.TryGetCountryCodeAsync(publicIp, cancellationToken);
            if (!string.IsNullOrEmpty(primary))
            {
                return primary;
            }
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogDebug(ex, "Primary geo provider failed; attempting fallback if configured.");
        }

        try
        {
            return await _fallback.TryGetCountryCodeAsync(publicIp, cancellationToken);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogDebug(ex, "Fallback geo provider failed.");
            
            return null;
        }
    }
}
