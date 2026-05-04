using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using FluentValidation;

namespace DreamTeamEver.Api.Features.Auth.RefreshToken;

public sealed class RefreshTokenValidator : Validator<RefreshTokenRequest>
{
    public RefreshTokenValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
