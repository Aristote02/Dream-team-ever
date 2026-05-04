using DreamTeamEver.Api.Authorization;
using DreamTeamEver.Api.Common;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using Microsoft.AspNetCore.Http;

namespace DreamTeamEver.Api.Features.Payments.InitiatePayment;

public sealed class InitiatePaymentEndpoint : Endpoint<InitiatePaymentRequest, PaymentTransactionDto>
{
    private readonly IPaymentService _payments;

    public InitiatePaymentEndpoint(IPaymentService payments) => _payments = payments;

    public override void Configure()
    {
        Post("/api/payments/initiate");
        Roles("Member");
        Summary(s => s.Description = "Start a registration payment (must match your member profile). Mpesa integration TBD.");
    }

    public override async Task HandleAsync(InitiatePaymentRequest req, CancellationToken ct)
    {
        var ownMemberId = User.GetMemberId();
        if (ownMemberId != req.MemberId)
        {
            await Send.ForbiddenAsync();
            return;
        }

        var tx = await _payments.InitiateAsync(req.MemberId, req.Method, ct);
        if (tx is null)
        {
            await Send.ResultAsync(
                Results.Json(new { error = ApiErrorMessages.PaymentInitFailed },
                    statusCode: StatusCodes.Status400BadRequest));
            return;
        }

        await Send.OkAsync(tx.ToPaymentDto(), ct);
    }
}
