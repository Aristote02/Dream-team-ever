using DreamTeamEver.Api.Authorization;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Members.GetMyPayments;

public sealed class GetMyPaymentsEndpoint : EndpointWithoutRequest<List<PaymentTransactionDto>>
{
    private readonly IPaymentService _payments;
    private readonly IMemberService _members;

    public GetMyPaymentsEndpoint(IPaymentService payments, IMemberService members)
    {
        _payments = payments;
        _members = members;
    }

    public override void Configure()
    {
        Get("/api/members/me/payments");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var me = await _members.GetByUserIdAsync(userId, ct);
        if (me is null)
        {
            await Send.ForbiddenAsync();
            return;
        }

        var rows = await _payments.ListTransactionsByMemberAsync(me.Id, ct);
        await Send.OkAsync([.. rows.Select(x => x.ToPaymentDto())], ct);
    }
}
