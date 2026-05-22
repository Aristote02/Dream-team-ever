using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Application.Dtos.Mpesa;
using DreamTeamEver.Application.Services;
using DreamTeamEver.Domain.Entities;
using Mapster;

namespace DreamTeamEver.Application.Mapping;

public static class MpesaMappingExtensions
{
    public static MpesaC2BRequestDto ToMpesaC2BRequestDto(this MpesaPaymentInitiationContext context) =>
        MpesaC2BRequestFactory.CreateRequest(context);

    public static MpesaC2BApiRequestDto ToMpesaC2BApiRequestDto(this MpesaC2BRequestDto request, string serviceProviderCode) =>
        MpesaC2BRequestFactory.CreateApiRequest(request, serviceProviderCode);

    public static MpesaC2BResultDto ToMpesaC2BResultDto(this MpesaOpenApiResponseDto response) =>
        response.Adapt<MpesaC2BResultDto>();

    public static MpesaCallbackAcknowledgement ToCallbackAcknowledgement(this MpesaCallbackAckContext context) =>
        context.Adapt<MpesaCallbackAcknowledgement>();

    public static MatriculeIssuedNotification ToMatriculeIssuedNotification(this PaymentTransaction payment, string matriculeCode) =>
        new MatriculeIssuedNotificationContext { Payment = payment, MatriculeCode = matriculeCode }
            .Adapt<MatriculeIssuedNotification>();
}
