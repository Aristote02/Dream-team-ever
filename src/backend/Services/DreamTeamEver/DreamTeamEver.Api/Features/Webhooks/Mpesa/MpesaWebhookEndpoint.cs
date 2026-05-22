using DreamTeamEver.Api.Constants;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Constants;
using DreamTeamEver.Application.Dtos.Mpesa;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Domain.Constants;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Webhooks.Mpesa;

public sealed class MpesaWebhookEndpoint : Endpoint<MpesaCallbackNotification, MpesaCallbackAcknowledgement>
{
    private readonly IPaymentService _payments;
    private readonly ILogger<MpesaWebhookEndpoint> _logger;

    public MpesaWebhookEndpoint(IPaymentService payments, ILogger<MpesaWebhookEndpoint> logger)
    {
        _payments = payments;
        _logger = logger;
    }

    public override void Configure()
    {
        Post(MpesaWebhookRoutes.Callback);
        AllowAnonymous();
        Summary(s => s.Description = "M-Pesa Open API async callback (C2B single stage).");
    }

    public override async Task HandleAsync(MpesaCallbackNotification req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.ThirdPartyConversationId)
            || !Guid.TryParse(req.ThirdPartyConversationId, out var paymentId))
        {
            _logger.LogWarning("M-Pesa callback missing or invalid ThirdPartyConversationID.");
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

            var invalidAck = new MpesaCallbackAckContext
            {
                Callback = req,
                ResponseCode = MpesaCallbackAcknowledgementCodes.Rejected,
                ResponseDescription = MpesaCallbackAcknowledgementDescriptions.InvalidThirdPartyConversationId,
            };

            await Send.OkAsync(invalidAck.ToCallbackAcknowledgement(), ct);
            return;
        }

        var providerTransactionId = string.IsNullOrWhiteSpace(req.TransactionId)
            ? req.OriginalConversationId ?? paymentId.ToString(MpesaConversationIdFormats.PaymentIdFormat)
            : req.TransactionId;

        var result = await _payments.CompleteFromProviderAsync(
            paymentId,
            providerTransactionId,
            req.IsSuccess,
            req.ResultDescription,
            ct);

        if (!result.Success && req.IsSuccess)
        {
            _logger.LogWarning(
                "M-Pesa callback success code but completion failed for {PaymentId}: {Error}",
                paymentId,
                result.Error);
        }

        var ackCode = result.Success || !req.IsSuccess
            ? MpesaCallbackAcknowledgementCodes.Accepted
            : MpesaCallbackAcknowledgementCodes.Rejected;

        var ackDescription = result.Success || !req.IsSuccess
            ? MpesaCallbackAcknowledgementDescriptions.SuccessfullyAcceptedResult
            : result.Error ?? MpesaCallbackAcknowledgementDescriptions.Rejected;

        var ackContext = new MpesaCallbackAckContext
        {
            Callback = req,
            ResponseCode = ackCode,
            ResponseDescription = ackDescription,
            PaymentId = paymentId,
        };

        await Send.OkAsync(ackContext.ToCallbackAcknowledgement(), ct);
    }
}
