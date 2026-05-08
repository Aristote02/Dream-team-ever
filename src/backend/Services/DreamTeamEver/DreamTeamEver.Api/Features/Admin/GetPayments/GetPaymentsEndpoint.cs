using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Contracts.Pagination;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Admin.GetPayments;

public sealed class GetPaymentsEndpoint : Endpoint<GetAllPaymentsRequest, PagedResult<PaymentTransactionDto>>
{
    private readonly IAdminService _admin;

    public GetPaymentsEndpoint(IAdminService admin) => _admin = admin;

    public override void Configure()
    {
        Get("/api/admin/payments");
    }

    public override async Task HandleAsync(GetAllPaymentsRequest req, CancellationToken ct)
    {
        var page = await _admin.GetPaymentsPagedAsync(req.PageNumber, req.PageSize, ct);
        await Send.OkAsync(page, ct);
    }
}
