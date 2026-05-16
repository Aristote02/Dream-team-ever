using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Domain.Options;
using DreamTeamEver.Infrastructure.Auth.Caching;
using DreamTeamEver.Infrastructure.Auth.GeoIp;
using DreamTeamEver.Infrastructure.Constants;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Extensions.Http;
using Polly.Wrap;

namespace DreamTeamEver.Infrastructure.Auth;

/// <summary>DI wiring for login location: <see cref="ILoginLocationKeyResolver"/>, bounded cache, and named geo HTTP clients.</summary>
internal static class GeoIpServiceCollectionExtensions
{
    /// <summary>Binds <see cref="GeoIpOptions"/> and registers the geo lookup pipeline used on sign-in.</summary>
    internal static IServiceCollection AddGeoIpLoginLocation(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<GeoIpOptions>(configuration.GetSection(GeoIpOptions.SectionName));

        services.AddSingleton<IpWhoIsGeoIpCountryCodeProvider>();
        services.AddSingleton<IpApiGeoIpCountryCodeProvider>();
        services.AddSingleton<IGeoIpCountryCodeProvider, ChainedGeoIpCountryCodeProvider>();
        services.AddSingleton<ILoginLocationCache, LoginLocationMemoryCache>();
        services.AddSingleton<ILoginLocationKeyResolver, IpWhoIsLoginLocationKeyResolver>();

        services.AddHttpClient(GeoIpHttpClientNames.Primary, (sp, client) =>
            ConfigureClient(sp, client, o => o.PrimaryBaseUrl))
            .AddPolicyHandler(CreateResiliencePolicy());

        services.AddHttpClient(GeoIpHttpClientNames.Fallback, (sp, client) =>
        {
            var options = sp.GetRequiredService<IOptions<GeoIpOptions>>().Value;
            var baseUrl = string.IsNullOrWhiteSpace(options.FallbackBaseUrl)
                ? "https://localhost/"
                : options.FallbackBaseUrl;
            ConfigureClient(sp, client, _ => baseUrl);
        }).AddPolicyHandler(CreateResiliencePolicy());

        return services;
    }

    private static void ConfigureClient(IServiceProvider sp, HttpClient client, Func<GeoIpOptions, string> baseUrlSelector)
    {
        var options = sp.GetRequiredService<IOptions<GeoIpOptions>>().Value;
        var baseUrl = baseUrlSelector(options);
        client.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
        client.Timeout = TimeSpan.FromSeconds(Math.Max(1, options.HttpTimeoutSeconds));
    }

    /// <summary>Circuit breaker (outer) then retry (inner). Each named client gets its own policy instance.</summary>
    private static AsyncPolicyWrap<HttpResponseMessage> CreateResiliencePolicy()
    {
        var retry = HttpPolicyExtensions
            .HandleTransientHttpError()
            .WaitAndRetryAsync(GeoIpResilienceConstants.RetryCount, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

        var circuitBreaker = HttpPolicyExtensions
            .HandleTransientHttpError()
            .CircuitBreakerAsync(GeoIpResilienceConstants.CircuitBreakerFailureThreshold, GeoIpResilienceConstants.CircuitBreakerBreakDuration);

        return Policy.WrapAsync(circuitBreaker, retry);
    }
}
