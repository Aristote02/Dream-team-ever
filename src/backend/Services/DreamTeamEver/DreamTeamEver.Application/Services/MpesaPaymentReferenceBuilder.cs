using DreamTeamEver.Application.Constants;
using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Services;

internal static class MpesaPaymentReferenceBuilder
{
    /// <summary>
    /// M-Pesa <c>input_TransactionReference</c> (1–20 chars). Vodacom samples use short alphanumeric values
    /// such as <c>T12344C</c>, not a full payment GUID.
    /// </summary>
    public static string BuildTransactionReference(PaymentType paymentType, Guid paymentId)
    {
        _ = paymentType;
        var suffix = paymentId.ToString(MpesaConversationIdFormats.PaymentIdFormat)[..MpesaTransactionReferencePrefixes.TransactionSuffixLength]
            .ToUpperInvariant();
        var reference = $"{MpesaTransactionReferencePrefixes.Transaction}{suffix}";
        return reference.Length <= MpesaTransactionReferencePrefixes.MaxTransactionReferenceLength
            ? reference
            : reference[..MpesaTransactionReferencePrefixes.MaxTransactionReferenceLength];
    }

    /// <summary>
    /// M-Pesa <c>input_ThirdPartyReference</c> (1–20 chars). Required on some Open API stacks alongside
    /// <c>input_ThirdPartyConversationID</c>; INS-17 is often raised when this is missing or too long.
    /// </summary>
    public static string BuildThirdPartyReference(Guid paymentId)
    {
        var hash = paymentId.GetHashCode();
        var numeric = (uint)(hash & 0x7FFFFFFF) % 100_000_000;
        var reference = numeric.ToString(System.Globalization.CultureInfo.InvariantCulture);
        if (reference.Length > MpesaTransactionReferencePrefixes.MaxThirdPartyReferenceLength)
        {
            reference = reference[..MpesaTransactionReferencePrefixes.MaxThirdPartyReferenceLength];
        }

        return reference.Length >= MpesaTransactionReferencePrefixes.MinThirdPartyReferenceLength
            ? reference
            : reference.PadLeft(MpesaTransactionReferencePrefixes.MinThirdPartyReferenceLength, '0');
    }

    public static string BuildPurchasedItemsDescription(PaymentType paymentType) =>
        paymentType switch
        {
            PaymentType.Registration => MpesaPurchasedItemDescriptions.RegistrationFee,
            PaymentType.ScolarFee => MpesaPurchasedItemDescriptions.ScolarFee,
            _ => MpesaPurchasedItemDescriptions.GenericMembershipFee,
        };
}
