namespace DreamTeamEver.Domain.Constants;

/// <summary>Values for <c>output_ResponseDesc</c> in the webhook acknowledgement body to M-Pesa.</summary>
public static class MpesaCallbackAcknowledgementDescriptions
{
    public const string SuccessfullyAcceptedResult = "Successfully Accepted Result";

    public const string InvalidThirdPartyConversationId = "Invalid ThirdPartyConversationID";

    public const string Rejected = "Rejected";
}
