using DreamTeamEver.Application.Abstractions;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Admin.DeleteUser;

public sealed class DeleteUserEndpoint : Endpoint<DeleteUserRequest>
{
    private readonly IAdminService _admin;

    public DeleteUserEndpoint(IAdminService admin) => _admin = admin;

    public override void Configure()
    {
        Delete("/api/admin/users/{UserId}");
        Roles("Admin");
    }

    public override async Task HandleAsync(DeleteUserRequest req, CancellationToken ct)
    {
        var ok = await _admin.DeleteUserAsync(req.UserId, ct);
        if (!ok)
        {
            await Send.NotFoundAsync();
            return;
        }

        await Send.NoContentAsync();
    }
}

public sealed record DeleteUserRequest(Guid UserId);
