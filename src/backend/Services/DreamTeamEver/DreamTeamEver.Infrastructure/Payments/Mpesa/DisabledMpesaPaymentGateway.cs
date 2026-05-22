using DreamTeamEver.Application.Abstractions.Payments;
using DreamTeamEver.Application.Constants;
using DreamTeamEver.Application.Dtos.Mpesa;
using DreamTeamEver.Application.Mapping;

namespace DreamTeamEver.Infrastructure.Payments.Mpesa;

internal sealed class DisabledMpesaPaymentGateway : IMpesaPaymentGateway
{
    public Task<MpesaC2BResultDto> InitiateC2BAsync(MpesaC2BRequestDto request, CancellationToken cancellationToken = default) =>
        Task.FromResult(new MpesaOpenApiResponseDto { ResponseDescription = MpesaPaymentMessages.IntegrationDisabled }
                .ToMpesaC2BResultDto());
}
