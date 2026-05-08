using DreamTeamEver.Api.Authorization;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Enums;
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
            await Send.NotFoundAsync(ct);
            return;
        }

        if (User.IsInRole(nameof(UserRole.Admin)))
        {
            await Send.OkAsync(tx.ToPaymentDto(), ct);
            return;
        }

        if (User.IsInRole(nameof(UserRole.Member)))
        {
            var ownMemberId = User.GetMemberId();
            if (ownMemberId != tx.MemberId)
            {
                await Send.ForbiddenAsync(ct);
                return;
            }

            await Send.OkAsync(tx.ToPaymentDto(), ct);
            return;
        }

        await Send.ForbiddenAsync(ct);
    }
}
