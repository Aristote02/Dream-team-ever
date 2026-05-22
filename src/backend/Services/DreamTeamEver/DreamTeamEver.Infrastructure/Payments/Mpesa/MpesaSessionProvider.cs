using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Constants;
using DreamTeamEver.Infrastructure.Constants;
using DreamTeamEver.Infrastructure.Payments.Mpesa.Abstractions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Infrastructure.Payments.Mpesa;

internal sealed class MpesaSessionProvider : IMpesaSessionProvider
{
    private readonly IMpesaOpenApiClient _client;
    private readonly IMemoryCache _cache;
    private readonly MpesaOptions _options;
    private readonly ILogger<MpesaSessionProvider> _logger;
    private readonly SemaphoreSlim _refreshLock = new(1, 1);

    public MpesaSessionProvider(IMpesaOpenApiClient client, IMemoryCache cache, IOptions<MpesaOptions> options, ILogger<MpesaSessionProvider> logger)
    {
        _client = client;
        _cache = cache;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<string> GetSessionIdAsync(CancellationToken cancellationToken)
    {
        if (_cache.TryGetValue<string>(MpesaCacheKeys.OpenApiSession, out var cached)
            && !string.IsNullOrWhiteSpace(cached))
        {
            return cached;
        }

        await _refreshLock.WaitAsync(cancellationToken);
        try
        {
            if (_cache.TryGetValue<string>(MpesaCacheKeys.OpenApiSession, out cached)
                && !string.IsNullOrWhiteSpace(cached))
            {
                return cached;
            }

            var response = await _client.CreateSessionAsync(cancellationToken);
            if (!response.IsSuccess || string.IsNullOrWhiteSpace(response.SessionId))
            {
                throw new InvalidOperationException(
                    response.ResponseDescription ?? MpesaPaymentMessages.SessionCreationFailed);
            }

            var sessionId = response.SessionId;
            var cacheMinutes = Math.Max(1, _options.SessionCacheMinutes);
            _cache.Set(MpesaCacheKeys.OpenApiSession, sessionId, TimeSpan.FromMinutes(cacheMinutes));

            var delaySeconds = Math.Max(0, _options.SessionLiveDelaySeconds);
            if (delaySeconds > 0)
            {
                _logger.LogDebug("Waiting {Seconds}s for M-Pesa session to become live.", delaySeconds);
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds), cancellationToken);
            }

            return sessionId;
        }
        finally
        {
            _refreshLock.Release();
        }
    }
}
