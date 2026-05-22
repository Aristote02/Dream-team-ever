namespace DreamTeamEver.Application.Constants;

public static class MpesaPaymentMessages
{
    public const string IntegrationDisabled = "M-Pesa integration is disabled. Set Mpesa:Enabled and configure API credentials.";

    public const string NotConfigured = "M-Pesa is not configured. Contact support or try again later.";

    public const string InitiationRejected = "M-Pesa rejected the payment request.";

    public const string InitiationFailed = "M-Pesa payment initiation failed.";

    public const string DeclinedByProvider = "Payment was declined by M-Pesa.";

    public const string SessionCreationFailed = "M-Pesa session creation failed.";
}
