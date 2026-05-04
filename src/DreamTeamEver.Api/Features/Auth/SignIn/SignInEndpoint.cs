using DreamTeamEver.Api.Common;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using Microsoft.AspNetCore.Http;

namespace DreamTeamEver.Api.Features.Auth.SignIn;

public sealed class SignInEndpoint : Endpoint<SignInRequest, AuthResponse>
{
    private readonly IAuthService _auth;

    public SignInEndpoint(IAuthService auth) => _auth = auth;

    public override void Configure()
    {
        Post("/api/auth/sign-in");
        AllowAnonymous();
    }

    public override async Task HandleAsync(SignInRequest req, CancellationToken ct)
    {
        var result = await _auth.SignInAsync(req, ct);
        if (result is null)
        {
            await Send.ResultAsync(
                Results.Json(new { error = ApiErrorMessages.InvalidCredentials },
                    statusCode: StatusCodes.Status401Unauthorized));
            return;
        }

        await Send.OkAsync(result, ct);
    }
}
