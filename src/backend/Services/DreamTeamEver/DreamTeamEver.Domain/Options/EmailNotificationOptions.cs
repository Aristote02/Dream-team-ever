using DreamTeamEver.Domain.Constants;

namespace DreamTeamEver.Domain.Options;

public sealed record EmailNotificationOptions : IDreamTeamEverOptions
{
    public static string SectionName => "Email";

    public bool Enabled { get; init; }
    public string SendGridApiKey { get; init; } = string.Empty;
    public string SenderEmail { get; init; } = string.Empty;
    public string SenderName { get; init; } = EmailDefaults.SenderName;
    public string LogoUrl { get; init; } = EmailDefaults.LogoUrl;
    public string FrontendBaseUrl { get; init; } = string.Empty;
    public string ResetPasswordPath { get; init; } = EmailDefaults.ResetPasswordPath;
    public string WelcomeSubject { get; init; } = EmailDefaults.WelcomeSubject;
    public string PasswordResetSubject { get; init; } = EmailDefaults.PasswordResetSubject;
    public string PasswordChangedSubject { get; init; } = EmailDefaults.PasswordChangedSubject;
    public string LoginAlertSubject { get; init; } = EmailDefaults.LoginAlertSubject;
    public string PaymentConfirmedSubject { get; init; } = EmailDefaults.PaymentConfirmedSubject;
    public string MatriculeIssuedSubject { get; init; } = EmailDefaults.MatriculeIssuedSubject;
    public string AccountDeletedSubject { get; init; } = EmailDefaults.AccountDeletedSubject;
    public string RoleChangedSubject { get; init; } = EmailDefaults.RoleChangedSubject;
    public string PendingPaymentReminderSubject { get; init; } = EmailDefaults.PendingPaymentReminderSubject;
    public bool EnablePendingPaymentReminders { get; init; } = EmailDefaults.EnablePendingPaymentReminders;
    public int PendingReminderMinAgeHours { get; init; } = EmailDefaults.PendingReminderMinAgeHours;
    public int PendingReminderWindowMinutes { get; init; } = EmailDefaults.PendingReminderWindowMinutes;
    public int PendingReminderIntervalMinutes { get; init; } = EmailDefaults.PendingReminderIntervalMinutes;
}
