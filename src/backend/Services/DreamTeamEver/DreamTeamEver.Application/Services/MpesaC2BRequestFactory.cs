using System.Globalization;
using DreamTeamEver.Application.Constants;
using DreamTeamEver.Application.Dtos.Mpesa;

namespace DreamTeamEver.Application.Services;

internal static class MpesaC2BRequestFactory
{
    public static MpesaC2BRequestDto CreateRequest(MpesaPaymentInitiationContext context) =>
        new()
        {
            PaymentId = context.Transaction.Id,
            PaymentType = context.Transaction.PaymentType,
            Amount = context.Transaction.Amount,
            Currency = context.Currency,
            CountryCode = context.CountryCode,
            CustomerMsisdn = context.CustomerMsisdn,
            TransactionReference = MpesaPaymentReferenceBuilder.BuildTransactionReference(
                context.Transaction.PaymentType,
                context.Transaction.Id),
            ThirdPartyReference = MpesaPaymentReferenceBuilder.BuildThirdPartyReference(context.Transaction.Id),
            PurchasedItemsDescription = MpesaPaymentReferenceBuilder.BuildPurchasedItemsDescription(
                context.Transaction.PaymentType),
        };

    public static MpesaC2BApiRequestDto CreateApiRequest(MpesaC2BRequestDto request, string serviceProviderCode) =>
        new()
        {
            Amount = request.Amount.ToString(MpesaFormattingConstants.AmountDecimalFormat, CultureInfo.InvariantCulture),
            Country = request.CountryCode,
            Currency = request.Currency,
            CustomerMsisdn = request.CustomerMsisdn,
            ServiceProviderCode = serviceProviderCode,
            ThirdPartyConversationId = request.PaymentId.ToString(MpesaConversationIdFormats.PaymentIdFormat),
            ThirdPartyReference = request.ThirdPartyReference,
            TransactionReference = request.TransactionReference,
            PurchasedItemsDescription = request.PurchasedItemsDescription,
        };
}
