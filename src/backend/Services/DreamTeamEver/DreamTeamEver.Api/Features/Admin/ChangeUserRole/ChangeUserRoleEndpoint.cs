using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Domain.Enums;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Admin.ChangeUserRole;

public sealed class ChangeUserRoleEndpoint : Endpoint<ChangeUserRoleRequest>
{
    private readonly IAdminService _admin;

    public ChangeUserRoleEndpoint(IAdminService admin) => _admin = admin;

    public override void Configure()
    {
        Put("/api/admin/users/{UserId}/role");
        Roles(nameof(UserRole.Admin));
    }

    public override async Task HandleAsync(ChangeUserRoleRequest req, CancellationToken ct)
    {
        var ok = await _admin.ChangeUserRoleAsync(req.UserId, req.Role, ct);
        if (!ok)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}
