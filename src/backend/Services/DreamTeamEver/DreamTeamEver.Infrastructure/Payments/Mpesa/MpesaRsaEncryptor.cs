using System.Security.Cryptography;
using System.Text;
using DreamTeamEver.Infrastructure.Constants;
using DreamTeamEver.Infrastructure.Payments.Mpesa.Abstractions;

namespace DreamTeamEver.Infrastructure.Payments.Mpesa;

/// <summary>RSA PKCS#1 encryption matching portal / OpenSSL <c>pkeyutl -encrypt</c>.</summary>
internal sealed class MpesaRsaEncryptor : IMpesaRsaEncryptor
{
    public string EncryptToBase64(string plaintext, string publicKeyMaterial)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(plaintext);
        ArgumentException.ThrowIfNullOrWhiteSpace(publicKeyMaterial);

        using var rsa = RSA.Create();
        rsa.ImportFromPem(NormalizePublicKeyPem(publicKeyMaterial));

        var data = Encoding.UTF8.GetBytes(plaintext);
        var encrypted = rsa.Encrypt(data, RSAEncryptionPadding.Pkcs1);
        return Convert.ToBase64String(encrypted);
    }

    private static string NormalizePublicKeyPem(string key)
    {
        var trimmed = key.Trim();
        if (trimmed.Contains(MpesaPublicKeyPemMarkers.PemHeaderToken, StringComparison.Ordinal))
        {
            return trimmed;
        }

        var base64 = trimmed.Replace("\r", "", StringComparison.Ordinal)
            .Replace("\n", "", StringComparison.Ordinal)
            .Replace(" ", "", StringComparison.Ordinal);

        var builder = new StringBuilder();
        builder.AppendLine(MpesaPublicKeyPemMarkers.BeginPublicKey);
        for (var i = 0; i < base64.Length; i += MpesaPublicKeyPemMarkers.Base64LineLength)
        {
            var length = Math.Min(MpesaPublicKeyPemMarkers.Base64LineLength, base64.Length - i);
            builder.AppendLine(base64.Substring(i, length));
        }

        builder.AppendLine(MpesaPublicKeyPemMarkers.EndPublicKey);
        return builder.ToString();
    }
}
