namespace DreamTeamEver.Application.Constants;

/// <summary>Asynchronous callback JSON property names from M-Pesa (<c>input_*</c>).</summary>
public static class MpesaCallbackPropertyNames
{
    public const string OriginalConversationId = "input_OriginalConversationID";
    public const string TransactionId = "input_TransactionID";
    public const string ResultCode = "input_ResultCode";
    public const string ResultDescription = "input_ResultDesc";
    public const string ThirdPartyConversationId = "input_ThirdPartyConversationID";
}
