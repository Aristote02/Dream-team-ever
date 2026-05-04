using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Admin.GetPayments;

public sealed class GetPaymentsEndpoint : EndpointWithoutRequest<List<PaymentTransactionDto>>
{
    private readonly IAdminService _admin;

    public GetPaymentsEndpoint(IAdminService admin) => _admin = admin;

    public override void Configure()
    {
        Get("/api/admin/payments");
        Roles("Admin");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var list = await _admin.GetAllPaymentsAsync(ct);
        await Send.OkAsync(list.ToList());
    }
}
