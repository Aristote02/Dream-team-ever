using DreamTeamEver.Api.Common;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Auth.SignUp;

public sealed class SignUpEndpoint : Endpoint<SignUpRequest, AuthResponse>
{
    private readonly IAuthService _auth;

    public SignUpEndpoint(IAuthService auth) => _auth = auth;

    public override void Configure()
    {
        Post("/api/auth/sign-up");
        AllowAnonymous();
        Summary(s =>
        {
            s.Summary = "Sign up";
            s.Description = "Creates a DreamTeamEver member account.";
        });
    }

    public override async Task HandleAsync(SignUpRequest req, CancellationToken ct)
    {
        var result = await _auth.SignUpAsync(req, ct);
        if (result is null)
        {
            await Send.ResultAsync(Results.Json(new { error = ApiErrorMessages.EmailAlreadyRegistered }, statusCode: StatusCodes.Status409Conflict));
            
            return;
        }

        await Send.ResponseAsync(result, StatusCodes.Status201Created, ct);
    }
}
