namespace DreamTeamEver.Domain.Constants;

public static class EmailDefaults
{
    public const string SenderName = "Dream Team Ever";
    public const string ResetPasswordPath = "/reset-password";

    public const string WelcomeSubject = "Welcome to Dream Team Ever";
    public const string PasswordResetSubject = "Reset your Dream Team Ever password";
    public const string PasswordChangedSubject = "Your Dream Team Ever password was changed";
    public const string LoginAlertSubject = "New login to your Dream Team Ever account";
    public const string PaymentConfirmedSubject = "Payment confirmed";
    public const string MatriculeIssuedSubject = "Your matricule is ready";
    public const string AccountDeletedSubject = "Your Dream Team Ever account was deleted";
    public const string RoleChangedSubject = "Your account role was updated";
    public const string PendingPaymentReminderSubject = "Complete your pending payment";

    public const int SmtpPort = 587;
    public const bool UseSsl = true;
    public const bool EnablePendingPaymentReminders = false;
    public const int PendingReminderMinAgeHours = 24;
    public const int PendingReminderWindowMinutes = 60;
    public const int PendingReminderIntervalMinutes = 60;
}
