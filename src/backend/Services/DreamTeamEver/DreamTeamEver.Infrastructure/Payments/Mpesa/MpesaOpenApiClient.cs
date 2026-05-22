using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Dtos.Mpesa;
using DreamTeamEver.Infrastructure.Constants;
using DreamTeamEver.Infrastructure.Payments.Mpesa.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Infrastructure.Payments.Mpesa;

internal sealed class MpesaOpenApiClient : IMpesaOpenApiClient
{
    /// <summary>M-Pesa expects exact <c>input_*</c> property names from <see cref="JsonPropertyNameAttribute"/>.</summary>
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = null,
        DictionaryKeyPolicy = null,
    };

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMpesaRsaEncryptor _encryptor;
    private readonly MpesaOptions _options;
    private readonly ILogger<MpesaOpenApiClient> _logger;

    public MpesaOpenApiClient(IHttpClientFactory httpClientFactory, IMpesaRsaEncryptor encryptor, IOptions<MpesaOptions> options, ILogger<MpesaOpenApiClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _encryptor = encryptor;
        _options = options.Value;
        _logger = logger;
    }

    public Task<MpesaOpenApiResponseDto> CreateSessionAsync(CancellationToken cancellationToken)
    {
        var encryptedApiKey = _encryptor.EncryptToBase64(_options.ApiKey, _options.ActivePublicKey);
        var path = MpesaOpenApiPaths.Build(_options.EnvironmentSegment, _options.Market, MpesaOpenApiPaths.GetSessionOperation);

        return SendAsync(HttpMethod.Get, path, encryptedApiKey, body: null, cancellationToken);
    }

    public Task<MpesaOpenApiResponseDto> InitiateC2BSingleStageAsync(string sessionId, MpesaC2BApiRequestDto request, CancellationToken cancellationToken)
    {
        var encryptedSession = _encryptor.EncryptToBase64(sessionId, _options.ActivePublicKey);
        var path = MpesaOpenApiPaths.Build(_options.EnvironmentSegment, _options.Market, MpesaOpenApiPaths.C2BSingleStageOperation);

        return SendAsync(HttpMethod.Post, path, encryptedSession, body: request, cancellationToken);
    }

    private async Task<MpesaOpenApiResponseDto> SendAsync(HttpMethod method, string path, string bearerToken, object? body, CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient(MpesaHttpClientNames.OpenApi);
        using var request = new HttpRequestMessage(method, path);
        request.Headers.TryAddWithoutValidation(MpesaHttpHeaderNames.Origin, _options.Origin);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);

        if (body is not null)
        {
            request.Content = JsonContent.Create(body, options: JsonOptions);
            if (body is MpesaC2BApiRequestDto c2b)
            {
                var json = JsonSerializer.Serialize(c2b, JsonOptions);
                _logger.LogInformation(
                    "M-Pesa C2B payload: ThirdPartyConversationID len={ThirdPartyLen}, ThirdPartyReference '{ThirdPartyReference}' (len={ThirdPartyReferenceLen}), TransactionReference '{TransactionReference}' (len={TransactionReferenceLen}), JSON={Json}",
                    c2b.ThirdPartyConversationId.Length,
                    c2b.ThirdPartyReference,
                    c2b.ThirdPartyReference.Length,
                    c2b.TransactionReference,
                    c2b.TransactionReference.Length,
                    json);
            }
        }

        using var response = await client.SendAsync(request, cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning(
                "M-Pesa Open API {Method} {Path} returned {StatusCode}: {Body}",
                method,
                path,
                (int)response.StatusCode,
                Truncate(payload));

            return new MpesaOpenApiResponseDto
            {
                ResponseCode = MpesaClientErrorCodes.HttpError,
                ResponseDescription = $"HTTP {(int)response.StatusCode}: {Truncate(payload)}",
            };
        }

        var parsed = JsonSerializer.Deserialize<MpesaOpenApiResponseDto>(payload, JsonOptions);
        return parsed ?? new MpesaOpenApiResponseDto
        {
            ResponseCode = MpesaClientErrorCodes.ParseError,
            ResponseDescription = MpesaClientErrorDescriptions.InvalidJsonResponse,
        };
    }

    private static string Truncate(string value) =>
        value.Length <= MpesaFormatting.HttpErrorBodyTruncateLength
            ? value
            : value[..MpesaFormatting.HttpErrorBodyTruncateLength] + MpesaFormatting.TruncationSuffix;
}
