using DreamTeamEver.Application.Dtos.Mpesa;

namespace DreamTeamEver.Application.Abstractions.Payments;

/// <summary>Initiates M-Pesa Open API C2B single-stage payments (port implemented in Infrastructure).</summary>
public interface IMpesaPaymentGateway
{
    Task<MpesaC2BResultDto> InitiateC2BAsync(MpesaC2BRequestDto request, CancellationToken cancellationToken = default);
}
