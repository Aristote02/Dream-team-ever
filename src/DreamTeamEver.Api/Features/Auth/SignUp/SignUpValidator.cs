using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using FluentValidation;

namespace DreamTeamEver.Api.Features.Auth.SignUp;

public sealed class SignUpValidator : Validator<SignUpRequest>
{
    public SignUpValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MinimumLength(2).MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).NotEmpty().MinimumLength(6).MaximumLength(32);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}
