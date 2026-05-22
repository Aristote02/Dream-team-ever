namespace DreamTeamEver.Infrastructure.Constants;

internal static class MpesaPublicKeyPemMarkers
{
    public const string BeginPublicKey = "-----BEGIN PUBLIC KEY-----";
    public const string EndPublicKey = "-----END PUBLIC KEY-----";
    public const string PemHeaderToken = "BEGIN PUBLIC KEY";
    public const int Base64LineLength = 64;
}
