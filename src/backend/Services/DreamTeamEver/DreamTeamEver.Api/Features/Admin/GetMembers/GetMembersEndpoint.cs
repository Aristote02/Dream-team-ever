using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Admin.GetMembers;

public sealed class GetMembersEndpoint : EndpointWithoutRequest<List<MemberSummaryDto>>
{
    private readonly IAdminService _admin;

    public GetMembersEndpoint(IAdminService admin) => _admin = admin;

    public override void Configure()
    {
        Get("/api/admin/members");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var list = await _admin.GetAllMembersAsync(ct);
        await Send.OkAsync(list.ToList(), ct);
    }
}
