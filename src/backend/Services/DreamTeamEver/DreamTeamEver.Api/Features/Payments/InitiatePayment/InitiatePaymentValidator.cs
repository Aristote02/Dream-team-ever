using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using FluentValidation;

namespace DreamTeamEver.Api.Features.Payments.InitiatePayment;

public sealed class InitiatePaymentValidator : Validator<InitiatePaymentRequest>
{
    public InitiatePaymentValidator()
    {
        RuleFor(x => x.MemberId).NotEqual(Guid.Empty);
        RuleFor(x => x.Method).IsInEnum();
    }
}
