namespace DreamTeamEver.Application.Constants;

/// <summary>C2B single-stage JSON body property names (<c>input_*</c>).</summary>
public static class MpesaRequestParameterNames
{
    public const string Amount = "input_Amount";
    public const string Country = "input_Country";
    public const string Currency = "input_Currency";
    public const string CustomerMsisdn = "input_CustomerMSISDN";
    public const string ServiceProviderCode = "input_ServiceProviderCode";
    public const string ThirdPartyConversationId = "input_ThirdPartyConversationID";
    public const string ThirdPartyReference = "input_ThirdPartyReference";
    public const string TransactionReference = "input_TransactionReference";
    public const string PurchasedItemsDescription = "input_PurchasedItemsDesc";
}
