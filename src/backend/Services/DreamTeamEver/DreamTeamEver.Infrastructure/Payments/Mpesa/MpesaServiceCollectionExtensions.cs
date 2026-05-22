using DreamTeamEver.Application.Abstractions.Payments;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Infrastructure.Constants;
using DreamTeamEver.Infrastructure.Payments.Mpesa.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Extensions.Http;
using Polly.Wrap;

namespace DreamTeamEver.Infrastructure.Payments.Mpesa;

internal static class MpesaServiceCollectionExtensions
{
    internal static IServiceCollection AddMpesaPayments(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MpesaOptions>(configuration.GetSection(MpesaOptions.SectionName));

        services.AddMemoryCache();
        services.AddSingleton<IMpesaRsaEncryptor, MpesaRsaEncryptor>();
        services.AddSingleton<IMpesaOpenApiClient, MpesaOpenApiClient>();
        services.AddSingleton<IMpesaSessionProvider, MpesaSessionProvider>();

        services.AddHttpClient(MpesaHttpClientNames.OpenApi, (sp, client) =>
        {
            var options = sp.GetRequiredService<IOptions<MpesaOptions>>().Value;
            client.BaseAddress = new Uri(options.BaseAddress.TrimEnd('/') + "/");
            client.Timeout = TimeSpan.FromSeconds(Math.Max(10, options.HttpTimeoutSeconds));
        }).AddPolicyHandler(CreateResiliencePolicy());

        services.AddSingleton<IMpesaPaymentGateway>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<MpesaOptions>>().Value;
            return options.Enabled
                ? sp.GetRequiredService<MpesaPaymentGateway>()
                : sp.GetRequiredService<DisabledMpesaPaymentGateway>();
        });

        services.AddSingleton<MpesaPaymentGateway>();
        services.AddSingleton<DisabledMpesaPaymentGateway>();

        return services;
    }

    private static AsyncPolicyWrap<HttpResponseMessage> CreateResiliencePolicy()
    {
        var retry = HttpPolicyExtensions
            .HandleTransientHttpError()
            .WaitAndRetryAsync(MpesaResilienceConstants.RetryCount, attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)));

        var circuitBreaker = HttpPolicyExtensions
            .HandleTransientHttpError()
            .CircuitBreakerAsync(MpesaResilienceConstants.CircuitBreakerFailureThreshold, MpesaResilienceConstants.CircuitBreakerBreakDuration);

        return Policy.WrapAsync(circuitBreaker, retry);
    }
}
