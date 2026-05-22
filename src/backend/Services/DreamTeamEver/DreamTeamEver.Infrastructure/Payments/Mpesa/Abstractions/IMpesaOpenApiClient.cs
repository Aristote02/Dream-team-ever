using DreamTeamEver.Application.Dtos.Mpesa;

namespace DreamTeamEver.Infrastructure.Payments.Mpesa.Abstractions;

internal interface IMpesaOpenApiClient
{
    Task<MpesaOpenApiResponseDto> CreateSessionAsync(CancellationToken cancellationToken);

    Task<MpesaOpenApiResponseDto> InitiateC2BSingleStageAsync(string sessionId, MpesaC2BApiRequestDto request, CancellationToken cancellationToken);
}
