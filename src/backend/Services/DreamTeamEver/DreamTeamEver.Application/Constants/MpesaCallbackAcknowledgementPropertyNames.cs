namespace DreamTeamEver.Application.Constants;

/// <summary>Webhook acknowledgement JSON property names to M-Pesa (<c>output_*</c>).</summary>
public static class MpesaCallbackAcknowledgementPropertyNames
{
    public const string OriginalConversationId = "output_OriginalConversationID";
    public const string ResponseCode = "output_ResponseCode";
    public const string ResponseDescription = "output_ResponseDesc";
    public const string ThirdPartyConversationId = "output_ThirdPartyConversationID";
}
