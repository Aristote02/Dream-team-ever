using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Auth.ForgotPassword;

/// <summary>
/// Always returns 204 when the request is valid — does not reveal whether the email exists.
/// In Development, the reset token is logged (replace with email delivery in production).
/// </summary>
public sealed class ForgotPasswordEndpoint : Endpoint<ForgotPasswordRequest>
{
    private readonly IAuthService _auth;

    public ForgotPasswordEndpoint(IAuthService auth) => _auth = auth;

    public override void Configure()
    {
        Post("/api/auth/forgot-password");
        AllowAnonymous();
    }

    public override async Task HandleAsync(ForgotPasswordRequest req, CancellationToken ct)
    {
        await _auth.ForgotPasswordAsync(req, ct);
        await Send.NoContentAsync(ct);
    }
}
