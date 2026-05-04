using DreamTeamEver.Api.Authorization;
using DreamTeamEver.Api.Common;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Api.Features.Payments.ConfirmPayment;

public sealed class ConfirmPaymentEndpoint : Endpoint<ConfirmPaymentRequest, PaymentConfirmationDto>
{
    private readonly IPaymentService _payments;
    private readonly DreamTeamEverOptions _options;
    private readonly IWebHostEnvironment _env;

    public ConfirmPaymentEndpoint(
        IPaymentService payments,
        IOptions<DreamTeamEverOptions> options,
        IWebHostEnvironment env)
    {
        _payments = payments;
        _options = options.Value;
        _env = env;
    }

    public override void Configure()
    {
        Post("/api/payments/{Id}/confirm");
        Summary(s =>
            s.Description = "Simulates a successful provider callback (member owner or Admin; dev / AllowPaymentSimulation). Mpesa integration TBD.");
    }

    public override async Task HandleAsync(ConfirmPaymentRequest req, CancellationToken ct)
    {
        if (!(_options.AllowPaymentSimulation || _env.IsDevelopment()))
        {
            await Send.ResultAsync(
                Results.Json(new { error = ApiErrorMessages.PaymentSimulationDisabled },
                    statusCode: StatusCodes.Status403Forbidden));
            return;
        }

        var tx = await _payments.GetTransactionAsync(req.Id, ct);
        if (tx is null)
        {
            await Send.NotFoundAsync();
            return;
        }

        if (!User.IsInRole("Admin"))
        {
            if (!User.IsInRole("Member"))
            {
                await Send.ForbiddenAsync();
                return;
            }

            var ownMemberId = User.GetMemberId();
            if (ownMemberId != tx.MemberId)
            {
                await Send.ForbiddenAsync();
                return;
            }
        }

        var result = await _payments.ConfirmAsync(req.Id, ct);
        if (!result.Success)
        {
            await Send.ResultAsync(
                Results.Json(new { error = result.Error }, statusCode: StatusCodes.Status400BadRequest));
            return;
        }

        var updated = await _payments.GetTransactionAsync(req.Id, ct);
        await Send.OkAsync(new PaymentConfirmationDto(result.MatriculeCode, updated?.ToPaymentDto()), ct);
    }
}

public sealed record ConfirmPaymentRequest(Guid Id);
