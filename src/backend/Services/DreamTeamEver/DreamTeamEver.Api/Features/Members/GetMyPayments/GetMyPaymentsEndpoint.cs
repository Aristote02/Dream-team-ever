using DreamTeamEver.Api.Authorization;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Members.GetMyPayments;

public sealed class GetMyPaymentsEndpoint : EndpointWithoutRequest<List<PaymentTransactionDto>>
{
    private readonly IPaymentService _payments;

    public GetMyPaymentsEndpoint(IPaymentService payments)
    {
        _payments = payments;
    }

    public override void Configure()
    {
        Get("/api/members/me/payments");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var rows = await _payments.ListTransactionsByUserAsync(userId, ct);
        
        await Send.OkAsync([.. rows.Select(x => x.ToPaymentDto())], ct);
    }
}
