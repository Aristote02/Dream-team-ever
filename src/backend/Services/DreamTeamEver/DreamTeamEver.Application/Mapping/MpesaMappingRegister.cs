using System.Globalization;
using DreamTeamEver.Application.Constants;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Application.Dtos.Mpesa;
using DreamTeamEver.Application.Services;
using DreamTeamEver.Domain.Entities;
using Mapster;

namespace DreamTeamEver.Application.Mapping;

/// <summary>Mapster rules for M-Pesa DTOs and payment notification mapping.</summary>
public sealed class MpesaMappingRegister : IRegister
{
    private static int _applied;

    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<MpesaPaymentInitiationContext, MpesaC2BRequestDto>()
            .Map(dest => dest.PaymentId, src => src.Transaction.Id)
            .Map(dest => dest.Amount, src => src.Transaction.Amount)
            .Map(dest => dest.Currency, src => src.Currency)
            .Map(dest => dest.CountryCode, src => src.CountryCode)
            .Map(dest => dest.CustomerMsisdn, src => src.CustomerMsisdn)
            .Map(dest => dest.TransactionReference, src => MpesaPaymentReferenceBuilder.BuildTransactionReference(src.Transaction.PaymentType, src.Transaction.Id))
            .Map(dest => dest.PurchasedItemsDescription, src => MpesaPaymentReferenceBuilder.BuildPurchasedItemsDescription(src.Transaction.PaymentType));

        config.NewConfig<MpesaC2BApiRequestContext, MpesaC2BApiRequestDto>()
            .Map(dest => dest.Amount, src => src.Request.Amount.ToString(MpesaFormattingConstants.AmountDecimalFormat, CultureInfo.InvariantCulture))
            .Map(dest => dest.Country, src => src.Request.CountryCode)
            .Map(dest => dest.Currency, src => src.Request.Currency)
            .Map(dest => dest.CustomerMsisdn, src => src.Request.CustomerMsisdn)
            .Map(dest => dest.ServiceProviderCode, src => src.ServiceProviderCode)
            .Map(dest => dest.ThirdPartyConversationId, src => src.Request.PaymentId.ToString(MpesaConversationIdFormats.PaymentIdFormat))
            .Map(dest => dest.TransactionReference, src => src.Request.TransactionReference)
            .Map(dest => dest.PurchasedItemsDescription, src => src.Request.PurchasedItemsDescription);

        config.NewConfig<MpesaOpenApiResponseDto, MpesaC2BResultDto>()
            .Map(dest => dest.Succeeded, src => src.IsSuccess)
            .Map(dest => dest.ConversationId, src => src.ConversationId)
            .Map(dest => dest.ResponseCode, src => src.ResponseCode)
            .Map(dest => dest.ResponseDescription, src => src.ResponseDescription)
            .Map(dest => dest.ErrorMessage, src => MapInitiationErrorMessage(src));

        config.NewConfig<MpesaCallbackAckContext, MpesaCallbackAcknowledgement>()
            .Map(dest => dest.OriginalConversationId, src => src.Callback.OriginalConversationId ?? string.Empty)
            .Map(dest => dest.ResponseCode, src => src.ResponseCode)
            .Map(dest => dest.ResponseDescription, src => src.ResponseDescription)
            .Map(dest => dest.ThirdPartyConversationId, src => ResolveThirdPartyConversationId(src));

        config.NewConfig<PaymentTransaction, PaymentConfirmedNotification>()
            .Map(dest => dest.RecipientEmail, src => src.Member.User == null ? string.Empty : src.Member.User.Email)
            .Map(dest => dest.RecipientName, src => src.Member.FullName)
            .Map(dest => dest.Amount, src => src.Amount)
            .Map(dest => dest.Currency, src => src.Currency)
            .Map(dest => dest.ConfirmedAtUtc, src => src.CompletedAt.HasValue ? src.CompletedAt.Value : DateTimeOffset.UtcNow)
            .Map(dest => dest.ProviderReference, src => src.ProviderReference);

        config.NewConfig<MatriculeIssuedNotificationContext, MatriculeIssuedNotification>()
            .Map(dest => dest.RecipientEmail, src => src.Payment.Member.User == null ? string.Empty : src.Payment.Member.User.Email)
            .Map(dest => dest.RecipientName, src => src.Payment.Member.FullName)
            .Map(dest => dest.MatriculeCode, src => src.MatriculeCode)
            .Map(dest => dest.IssuedAtUtc, src => DateTimeOffset.UtcNow);
    }

    public static void ApplyGlobal()
    {
        if (Interlocked.Exchange(ref _applied, 1) != 0)
        {
            return;
        }

        new MpesaMappingRegister().Register(TypeAdapterConfig.GlobalSettings);
    }

    private static string? MapInitiationErrorMessage(MpesaOpenApiResponseDto src) =>
        src.IsSuccess ? null : src.ResponseDescription ?? MpesaPaymentMessages.InitiationRejected;

    private static string ResolveThirdPartyConversationId(MpesaCallbackAckContext src)
    {
        if (!string.IsNullOrWhiteSpace(src.Callback.ThirdPartyConversationId))
        {
            return src.Callback.ThirdPartyConversationId;
        }

        return src.PaymentId.HasValue
            ? src.PaymentId.Value.ToString(MpesaConversationIdFormats.PaymentIdFormat)
            : string.Empty;
    }
}
