namespace DreamTeamEver.Infrastructure.Payments.Mpesa.Abstractions;

internal interface IMpesaRsaEncryptor
{
    string EncryptToBase64(string plaintext, string publicKeyMaterial);
}
