using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Domain.Enums;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Admin.DeleteUser;

public sealed class DeleteUserEndpoint : Endpoint<DeleteUserRequest>
{
    private readonly IAdminService _admin;

    public DeleteUserEndpoint(IAdminService admin) => _admin = admin;

    public override void Configure()
    {
        Delete("/api/admin/users/{UserId}");
        Roles(nameof(UserRole.Admin));
    }

    public override async Task HandleAsync(DeleteUserRequest req, CancellationToken ct)
    {
        var ok = await _admin.DeleteUserAsync(req.UserId, ct);
        if (!ok)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}
