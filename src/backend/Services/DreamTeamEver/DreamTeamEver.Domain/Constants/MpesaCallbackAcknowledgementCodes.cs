namespace DreamTeamEver.Domain.Constants;

/// <summary>Values for <c>output_ResponseCode</c> in the webhook acknowledgement body to M-Pesa.</summary>
public static class MpesaCallbackAcknowledgementCodes
{
    /// <summary>Listener accepted the callback payload (portal: close the session).</summary>
    public const string Accepted = "0";

    /// <summary>Listener rejected the callback payload (validation / processing error).</summary>
    public const string Rejected = "1";
}
