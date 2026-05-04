using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using FluentValidation;

namespace DreamTeamEver.Api.Features.Auth.ForgotPassword;

public sealed class ForgotPasswordValidator : Validator<ForgotPasswordRequest>
{
    public ForgotPasswordValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}
