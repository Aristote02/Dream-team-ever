using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using Microsoft.AspNetCore.Http;

namespace DreamTeamEver.Api.Features.Auth.ResetPassword;

public sealed class ResetPasswordEndpoint : Endpoint<ResetPasswordRequest>
{
    private readonly IAuthService _auth;

    public ResetPasswordEndpoint(IAuthService auth) => _auth = auth;

    public override void Configure()
    {
        Post("/api/auth/reset-password");
        AllowAnonymous();
    }

    public override async Task HandleAsync(ResetPasswordRequest req, CancellationToken ct)
    {
        var ok = await _auth.ResetPasswordAsync(req, ct);
        if (!ok)
        {
            await Send.ResultAsync(
                Results.Json(new { error = "Invalid or expired reset request." },
                    statusCode: StatusCodes.Status400BadRequest));
            return;
        }

        await Send.NoContentAsync(ct);
    }
}
