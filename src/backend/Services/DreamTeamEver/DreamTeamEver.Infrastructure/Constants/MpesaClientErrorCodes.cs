namespace DreamTeamEver.Infrastructure.Constants;

/// <summary>Internal codes when the HTTP client fails before a valid M-Pesa payload is returned.</summary>
internal static class MpesaClientErrorCodes
{
    public const string HttpError = "HTTP-ERROR";
    public const string ParseError = "PARSE-ERROR";
}
