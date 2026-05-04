using DreamTeamEver.Api.Authorization;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Payments.GetPaymentById;

public sealed class GetPaymentByIdEndpoint : Endpoint<GetPaymentByIdRequest, PaymentTransactionDto>
{
    private readonly IPaymentService _payments;

    public GetPaymentByIdEndpoint(IPaymentService payments) => _payments = payments;

    public override void Configure()
    {
        Get("/api/payments/{Id}");
    }

    public override async Task HandleAsync(GetPaymentByIdRequest req, CancellationToken ct)
    {
        var tx = await _payments.GetTransactionAsync(req.Id, ct);
        if (tx is null)
        {
            await Send.NotFoundAsync();
            return;
        }

        if (User.IsInRole("Admin"))
        {
            await Send.OkAsync(tx.ToPaymentDto());
            return;
        }

        if (User.IsInRole("Member"))
        {
            var ownMemberId = User.GetMemberId();
            if (ownMemberId != tx.MemberId)
            {
                await Send.ForbiddenAsync();
                return;
            }

            await Send.OkAsync(tx.ToPaymentDto());
            return;
        }

        await Send.ForbiddenAsync();
    }
}

public sealed record GetPaymentByIdRequest(Guid Id);
