namespace DreamTeamEver.Api.Common;

internal static class ApiErrorMessages
{
    internal const string EmailAlreadyRegistered = "Email is already registered.";
    internal const string InvalidCredentials = "Invalid email or password.";
    internal const string PaymentInitFailed = "Member not found, already has a matricule, or cannot start payment.";
    internal const string PaymentSimulationDisabled = "Payment simulation is disabled.";
}
