using DreamTeamEver.Application.Abstractions.Payments;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Dtos.Mpesa;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Infrastructure.Payments.Mpesa.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Infrastructure.Payments.Mpesa;

internal sealed class MpesaPaymentGateway : IMpesaPaymentGateway
{
    private readonly IMpesaSessionProvider _sessions;
    private readonly IMpesaOpenApiClient _client;
    private readonly MpesaOptions _options;
    private readonly ILogger<MpesaPaymentGateway> _logger;

    public MpesaPaymentGateway(IMpesaSessionProvider sessions, IMpesaOpenApiClient client, IOptions<MpesaOptions> options, ILogger<MpesaPaymentGateway> logger)
    {
        _sessions = sessions;
        _client = client;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<MpesaC2BResultDto> InitiateC2BAsync(MpesaC2BRequestDto request, CancellationToken cancellationToken = default)
    {
        try
        {
            var sessionId = await _sessions.GetSessionIdAsync(cancellationToken);
            var apiRequest = request.ToMpesaC2BApiRequestDto(_options.ServiceProviderCode);
            var response = await _client.InitiateC2BSingleStageAsync(sessionId, apiRequest, cancellationToken);

            if (!response.IsSuccess)
            {
                _logger.LogWarning("M-Pesa C2B failed for payment {PaymentId}: {Code} {Desc}", request.PaymentId, response.ResponseCode, response.ResponseDescription);
            }

            return response.ToMpesaC2BResultDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "M-Pesa C2B failed for payment {PaymentId}.", request.PaymentId);

            return new MpesaOpenApiResponseDto { ResponseDescription = ex.Message }
                .ToMpesaC2BResultDto();
        }
    }
}
