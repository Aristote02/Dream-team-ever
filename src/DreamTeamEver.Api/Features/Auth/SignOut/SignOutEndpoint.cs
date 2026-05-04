using DreamTeamEver.Api.Authorization;
using DreamTeamEver.Application.Abstractions;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Auth.SignOut;

public sealed class SignOutEndpoint : EndpointWithoutRequest
{
    private readonly IAuthService _auth;

    public SignOutEndpoint(IAuthService auth) => _auth = auth;

    public override void Configure()
    {
        Post("/api/auth/sign-out");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var jti = User.GetAccessTokenJti();
        if (string.IsNullOrEmpty(jti))
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var exp = User.GetAccessTokenExpiresUtc() ?? DateTimeOffset.UtcNow.AddMinutes(5);
        await _auth.SignOutAsync(userId, jti, exp, ct);
        await Send.NoContentAsync(ct);
    }
}
