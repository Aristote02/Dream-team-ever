using Microsoft.Extensions.Options;

namespace DreamTeamEver.Domain.Options.Validators;

public sealed class EmailNotificationOptionsValidator : IValidateOptions<EmailNotificationOptions>
{
    public ValidateOptionsResult Validate(string? name, EmailNotificationOptions options)
    {
        if (options is null)
        {
            return ValidateOptionsResult.Fail("EmailNotificationOptions object is null.");
        }

        if (!options.Enabled)
        {
            return ValidateOptionsResult.Success;
        }

        var errors = new List<string>();
        ValidateRequired(options.SendGridApiKey, nameof(options.SendGridApiKey), errors);
        ValidateRequired(options.SenderEmail, nameof(options.SenderEmail), errors);
        ValidateRequired(options.SenderName, nameof(options.SenderName), errors);
        ValidateRequired(options.FrontendBaseUrl, nameof(options.FrontendBaseUrl), errors);
        ValidateRequired(options.ResetPasswordPath, nameof(options.ResetPasswordPath), errors);
        ValidateRequired(options.WelcomeSubject, nameof(options.WelcomeSubject), errors);
        ValidateRequired(options.PasswordResetSubject, nameof(options.PasswordResetSubject), errors);
        ValidateRequired(options.PasswordChangedSubject, nameof(options.PasswordChangedSubject), errors);
        ValidateRequired(options.LoginAlertSubject, nameof(options.LoginAlertSubject), errors);
        ValidateRequired(options.PaymentConfirmedSubject, nameof(options.PaymentConfirmedSubject), errors);
        ValidateRequired(options.MatriculeIssuedSubject, nameof(options.MatriculeIssuedSubject), errors);
        ValidateRequired(options.AccountDeletedSubject, nameof(options.AccountDeletedSubject), errors);
        ValidateRequired(options.RoleChangedSubject, nameof(options.RoleChangedSubject), errors);
        ValidateRequired(options.PendingPaymentReminderSubject, nameof(options.PendingPaymentReminderSubject), errors);

        if (!string.IsNullOrWhiteSpace(options.CloudinaryLogoPublicId))
        {
            ValidateRequired(options.CloudinaryCloudName, nameof(options.CloudinaryCloudName), errors);
            ValidateRequired(options.CloudinaryApiKey, nameof(options.CloudinaryApiKey), errors);
            ValidateRequired(options.CloudinaryApiSecret, nameof(options.CloudinaryApiSecret), errors);
        }

        if (options.PendingReminderMinAgeHours <= 0)
        {
            errors.Add($"{nameof(options.PendingReminderMinAgeHours)} must be greater than 0.");
        }

        if (options.PendingReminderWindowMinutes <= 0)
        {
            errors.Add($"{nameof(options.PendingReminderWindowMinutes)} must be greater than 0.");
        }

        if (options.PendingReminderIntervalMinutes <= 0)
        {
            errors.Add($"{nameof(options.PendingReminderIntervalMinutes)} must be greater than 0.");
        }

        return errors.Count == 0
            ? ValidateOptionsResult.Success
            : ValidateOptionsResult.Fail(errors);
    }

    private static void ValidateRequired(string? value, string propertyName, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors.Add($"{propertyName} is required when email notifications are enabled.");
            return;
        }

        if (value == "*")
        {
            errors.Add($"{propertyName} has value '*', which usually means that value is not initialized.");
        }
    }
}
