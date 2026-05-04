using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using FluentValidation;

namespace DreamTeamEver.Api.Features.Auth.SignIn;

public sealed class SignInValidator : Validator<SignInRequest>
{
    public SignInValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}
