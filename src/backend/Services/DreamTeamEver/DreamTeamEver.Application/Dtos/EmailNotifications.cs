namespace DreamTeamEver.Application.Dtos;

public sealed record WelcomeNotification(
    string RecipientEmail,
    string? RecipientName);

public sealed record PasswordResetNotification(
    string RecipientEmail,
    string? RecipientName,
    string ResetToken,
    DateTimeOffset ExpiresAtUtc);

public sealed record PasswordChangedNotification(
    string RecipientEmail,
    string? RecipientName,
    DateTimeOffset ChangedAtUtc);

public sealed record LoginAlertNotification(
    string RecipientEmail,
    string? RecipientName,
    string Location,
    string UserAgent,
    DateTimeOffset LoggedInAtUtc);

public sealed record PaymentConfirmedNotification(
    string RecipientEmail,
    string? RecipientName,
    decimal Amount,
    string Currency,
    DateTimeOffset ConfirmedAtUtc,
    string? ProviderReference);

public sealed record MatriculeIssuedNotification(
    string RecipientEmail,
    string? RecipientName,
    string MatriculeCode,
    DateTimeOffset IssuedAtUtc);

public sealed record AccountDeletedNotification(
    string RecipientEmail,
    string? RecipientName,
    DateTimeOffset DeletedAtUtc);

public sealed record RoleChangedNotification(
    string RecipientEmail,
    string? RecipientName,
    string NewRole,
    DateTimeOffset ChangedAtUtc);

public sealed record PendingPaymentReminderNotification(
    string RecipientEmail,
    string? RecipientName,
    decimal Amount,
    string Currency,
    DateTimeOffset CreatedAtUtc,
    string? ProviderReference);
