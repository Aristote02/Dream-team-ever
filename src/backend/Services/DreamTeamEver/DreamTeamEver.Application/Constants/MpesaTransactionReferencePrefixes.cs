namespace DreamTeamEver.Application.Constants;

public static class MpesaTransactionReferencePrefixes
{
    /// <summary>Short customer-facing ref (portal / Elixir samples: <c>T12344C</c>, 7 chars).</summary>
    public const string Transaction = "T";

    public const int MaxTransactionReferenceLength = 20;
    public const int TransactionSuffixLength = 6;

    public const int MinThirdPartyReferenceLength = 1;
    public const int MaxThirdPartyReferenceLength = 20;
}
