using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Enums;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Admin.GetUsers;

public sealed class GetUsersEndpoint : EndpointWithoutRequest<List<UserAccountDto>>
{
    private readonly IAdminService _admin;

    public GetUsersEndpoint(IAdminService admin) => _admin = admin;

    public override void Configure()
    {
        Get("/api/admin/users");
        Roles(nameof(UserRole.Admin));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var list = await _admin.GetAllUsersAsync(ct);
        await Send.OkAsync(list.ToList(), ct);
    }
}
