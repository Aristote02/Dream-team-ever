using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using FluentValidation;

namespace DreamTeamEver.Api.Features.Members.UpdateMe;

public sealed class UpdateMeValidator : Validator<UpdateMyProfileRequest>
{
    public UpdateMeValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MinimumLength(2).MaximumLength(200);
        RuleFor(x => x.Phone).NotEmpty().MinimumLength(6).MaximumLength(32);
    }
}
