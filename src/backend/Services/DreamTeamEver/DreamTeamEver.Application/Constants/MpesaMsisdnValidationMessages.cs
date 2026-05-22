namespace DreamTeamEver.Application.Constants;

public static class MpesaMsisdnValidationMessages
{
    public const string PhoneRequired = "Member phone number is required for M-Pesa payment.";

    public const string InvalidLength = "Phone number must contain 12 to 14 digits for M-Pesa (include country code, e.g. 243…).";
}
