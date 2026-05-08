using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Enums;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Admin.GetMembersWithMatricule;

public sealed class GetMembersWithMatriculeEndpoint : EndpointWithoutRequest<List<MemberSummaryDto>>
{
    private readonly IAdminService _admin;

    public GetMembersWithMatriculeEndpoint(IAdminService admin) => _admin = admin;

    public override void Configure()
    {
        Get("/api/admin/members/with-matricule");
        Roles(nameof(UserRole.Admin));
        Summary(s => s.Description = "Members who completed payment and received a matricule.");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var list = await _admin.GetMembersWithMatriculeAsync(ct);
        await Send.OkAsync(list.ToList(), ct);
    }
}
