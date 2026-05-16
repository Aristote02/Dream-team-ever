using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Domain.Constants;
using DreamTeamEver.Domain.Options;
using DreamTeamEver.Infrastructure.Auth.Caching;
using DreamTeamEver.Infrastructure.Auth.GeoIp;
using DreamTeamEver.Infrastructure.Auth.Networking;
using DreamTeamEver.Infrastructure.Auth.Telemetry;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Infrastructure.Auth;

/// <summary>
/// End-to-end login location key: parse/resolve IP to cache (hashed key) to geo lookup.
/// Returns a country code, or <see cref="LoginLocationKeys.Unknown"/> when input is missing, non-public, or lookup fails.
/// </summary>
internal sealed class IpWhoIsLoginLocationKeyResolver : ILoginLocationKeyResolver
{
    private readonly IGeoIpCountryCodeProvider _geoIp;
    private readonly ILoginLocationCache _cache;
    private readonly GeoIpOptions _options;
    private readonly ILogger<IpWhoIsLoginLocationKeyResolver> _logger;

    public IpWhoIsLoginLocationKeyResolver(IGeoIpCountryCodeProvider geoIp, ILoginLocationCache cache, IOptions<GeoIpOptions> options, ILogger<IpWhoIsLoginLocationKeyResolver> logger)
    {
        _geoIp = geoIp;
        _cache = cache;
        _options = options.Value;
        _logger = logger;
    }

    public async ValueTask<string> ResolveLocationKeyAsync(string? ipAddress, CancellationToken cancellationToken = default)
    {
        using var activity = LoginLocationTelemetry.ActivitySource.StartActivity("ResolveLocationKey");

        if (string.IsNullOrWhiteSpace(ipAddress))
        {
            activity?.SetTag("location.key", LoginLocationKeys.Unknown);
            
            return LoginLocationKeys.Unknown;
        }

        var dnsTimeout = TimeSpan.FromSeconds(Math.Max(1, _options.DnsResolutionTimeoutSeconds));
        var ip = await ClientAddressParser.TryParseOrResolveAsync(ipAddress, dnsTimeout, cancellationToken);
        if (ip is null)
        {
            _logger.LogDebug("No public client IP available for location lookup; using unknown location key.");
            activity?.SetTag("location.key", LoginLocationKeys.Unknown);

            return LoginLocationKeys.Unknown;
        }

        var cacheKey = ClientAddressHash.BuildCacheKey(ip);
        if (_cache.TryGet(cacheKey, out var cached) && !string.IsNullOrEmpty(cached))
        {
            activity?.SetTag("ip.cached", true);
            activity?.SetTag("location.key", cached);
            
            return cached;
        }

        activity?.SetTag("ip.cached", false);

        var ipFingerprint = ClientAddressHash.GetLoggingFingerprint(ip);
        string locationKey;
        try
        {
            var countryCode = await _geoIp.TryGetCountryCodeAsync(ip, cancellationToken);
            locationKey = string.IsNullOrWhiteSpace(countryCode)
                ? LoginLocationKeys.Unknown
                : countryCode;

            if (locationKey == LoginLocationKeys.Unknown)
            {
                _logger.LogDebug("Geo lookup returned no country for client address fingerprint {IpFingerprint}.", ipFingerprint);
            }
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogDebug(ex, "Could not resolve country for client address fingerprint {IpFingerprint}; using unknown location key.", ipFingerprint);
            locationKey = LoginLocationKeys.Unknown;
        }

        var ttl = TimeSpan.FromHours(Math.Max(1, _options.CacheEntryTtlHours));
        _cache.Set(cacheKey, locationKey, ttl);

        activity?.SetTag("location.key", locationKey);
        
        return locationKey;
    }
}
