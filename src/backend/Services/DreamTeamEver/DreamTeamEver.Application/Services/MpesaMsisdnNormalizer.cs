using System.Text;
using DreamTeamEver.Application.Constants;

namespace DreamTeamEver.Application.Services;

internal static class MpesaMsisdnNormalizer
{
    public static bool TryNormalize(string? phone, out string msisdn, out string? error)
    {
        msisdn = string.Empty;
        error = null;

        if (string.IsNullOrWhiteSpace(phone))
        {
            error = MpesaMsisdnValidationMessages.PhoneRequired;
            return false;
        }

        var digits = new StringBuilder(phone.Length);
        foreach (var ch in phone)
        {
            if (char.IsDigit(ch))
            {
                digits.Append(ch);
            }
        }

        msisdn = digits.ToString();
        if (msisdn.Length is >= MpesaMsisdnValidationRules.MinDigitCount and <= MpesaMsisdnValidationRules.MaxDigitCount)
        {
            return true;
        }

        error = MpesaMsisdnValidationMessages.InvalidLength;
        return false;
    }
}
