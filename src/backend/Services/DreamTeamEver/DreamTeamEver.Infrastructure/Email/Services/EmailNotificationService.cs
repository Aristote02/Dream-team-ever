using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Constants;
using DreamTeamEver.Domain.Options;
using DreamTeamEver.Infrastructure.Email.Rendering;
using DreamTeamEver.Infrastructure.Email.Sending;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Infrastructure.Email.Services;

internal sealed class EmailNotificationService : IEmailNotificationService
{
    private readonly EmailNotificationOptions _options;
    private readonly IMustacheTemplateRenderer _renderer;
    private readonly IEmailSender _sender;
    private readonly ILogger<EmailNotificationService> _logger;
    private readonly Lazy<string> _logoDataUri;

    public EmailNotificationService(
        IOptions<EmailNotificationOptions> options,
        IMustacheTemplateRenderer renderer,
        IEmailSender sender,
        ILogger<EmailNotificationService> logger)
    {
        _options = options.Value;
        _renderer = renderer;
        _sender = sender;
        _logger = logger;
        _logoDataUri = new Lazy<string>(LoadLogoDataUri);
    }

    public async Task SendWelcomeAsync(WelcomeNotification notification, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        var html = _renderer.Render(EmailTemplateNames.Welcome, new
        {
            recipientName = NameOrDefault(notification.RecipientName),
            logoSvgDataUri = _logoDataUri.Value
        });

        await SendAndLogAsync(notification.RecipientEmail, _options.WelcomeSubject, html, "Welcome", cancellationToken);
    }

    public async Task SendPasswordResetAsync(PasswordResetNotification notification, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        var html = _renderer.Render(EmailTemplateNames.PasswordReset, new
        {
            recipientName = NameOrDefault(notification.RecipientName),
            resetLink = BuildResetLink(notification.ResetToken, notification.RecipientEmail),
            expiresAtUtc = FormatUtc(notification.ExpiresAtUtc),
            logoSvgDataUri = _logoDataUri.Value
        });

        await SendAndLogAsync(notification.RecipientEmail, _options.PasswordResetSubject, html, "Password reset", cancellationToken);
    }

    public async Task SendPasswordChangedAsync(PasswordChangedNotification notification, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        var html = _renderer.Render(EmailTemplateNames.PasswordChanged, new
        {
            recipientName = NameOrDefault(notification.RecipientName),
            changedAtUtc = FormatUtc(notification.ChangedAtUtc),
            logoSvgDataUri = _logoDataUri.Value
        });

        await SendAndLogAsync(notification.RecipientEmail, _options.PasswordChangedSubject, html, "Password changed", cancellationToken);
    }

    public async Task SendLoginAlertAsync(LoginAlertNotification notification, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        var html = _renderer.Render(EmailTemplateNames.LoginAlert, new
        {
            recipientName = NameOrDefault(notification.RecipientName),
            ipAddress = notification.IpAddress,
            userAgent = notification.UserAgent,
            loggedInAtUtc = FormatUtc(notification.LoggedInAtUtc),
            logoSvgDataUri = _logoDataUri.Value
        });

        await SendAndLogAsync(notification.RecipientEmail, _options.LoginAlertSubject, html, "Login alert", cancellationToken);
    }

    public async Task SendPaymentConfirmedAsync(PaymentConfirmedNotification notification, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        var html = _renderer.Render(EmailTemplateNames.PaymentConfirmed, new
        {
            recipientName = NameOrDefault(notification.RecipientName),
            amount = notification.Amount.ToString("0.00"),
            currency = notification.Currency,
            confirmedAtUtc = FormatUtc(notification.ConfirmedAtUtc),
            providerReference = string.IsNullOrWhiteSpace(notification.ProviderReference) ? "N/A" : notification.ProviderReference,
            logoSvgDataUri = _logoDataUri.Value
        });

        await SendAndLogAsync(notification.RecipientEmail, _options.PaymentConfirmedSubject, html, "Payment confirmed", cancellationToken);
    }

    public async Task SendMatriculeIssuedAsync(MatriculeIssuedNotification notification, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        var html = _renderer.Render(EmailTemplateNames.MatriculeIssued, new
        {
            recipientName = NameOrDefault(notification.RecipientName),
            matriculeCode = notification.MatriculeCode,
            issuedAtUtc = FormatUtc(notification.IssuedAtUtc),
            logoSvgDataUri = _logoDataUri.Value
        });

        await SendAndLogAsync(notification.RecipientEmail, _options.MatriculeIssuedSubject, html, "Matricule issued", cancellationToken);
    }

    public async Task SendAccountDeletedAsync(AccountDeletedNotification notification, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        var html = _renderer.Render(EmailTemplateNames.AccountDeleted, new
        {
            recipientName = NameOrDefault(notification.RecipientName),
            deletedAtUtc = FormatUtc(notification.DeletedAtUtc),
            logoSvgDataUri = _logoDataUri.Value
        });

        await SendAndLogAsync(notification.RecipientEmail, _options.AccountDeletedSubject, html, "Account deleted", cancellationToken);
    }

    public async Task SendRoleChangedAsync(RoleChangedNotification notification, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        var html = _renderer.Render(EmailTemplateNames.RoleChanged, new
        {
            recipientName = NameOrDefault(notification.RecipientName),
            newRole = notification.NewRole,
            changedAtUtc = FormatUtc(notification.ChangedAtUtc),
            logoSvgDataUri = _logoDataUri.Value
        });

        await SendAndLogAsync(notification.RecipientEmail, _options.RoleChangedSubject, html, "Role changed", cancellationToken);
    }

    public async Task SendPendingPaymentReminderAsync(PendingPaymentReminderNotification notification, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        var html = _renderer.Render(EmailTemplateNames.PendingPaymentReminder, new
        {
            recipientName = NameOrDefault(notification.RecipientName),
            amount = notification.Amount.ToString("0.00"),
            currency = notification.Currency,
            createdAtUtc = FormatUtc(notification.CreatedAtUtc),
            providerReference = string.IsNullOrWhiteSpace(notification.ProviderReference) ? "N/A" : notification.ProviderReference,
            logoSvgDataUri = _logoDataUri.Value
        });

        await SendAndLogAsync(notification.RecipientEmail, _options.PendingPaymentReminderSubject, html, "Pending payment reminder", cancellationToken);
    }

    private async Task SendAndLogAsync(string email, string subject, string html, string kind, CancellationToken cancellationToken)
    {
        await _sender.SendAsync(email, subject, html, cancellationToken);
        _logger.LogInformation("{EmailKind} email sent to {Email}.", kind, email);
    }

    private string BuildResetLink(string token, string email)
    {
        var baseUrl = _options.FrontendBaseUrl.TrimEnd('/');
        var path = _options.ResetPasswordPath.StartsWith('/') ? _options.ResetPasswordPath : "/" + _options.ResetPasswordPath;
        return $"{baseUrl}{path}?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(email)}";
    }

    private static string NameOrDefault(string? recipientName) => string.IsNullOrWhiteSpace(recipientName) ? "there" : recipientName;
    private static string FormatUtc(DateTimeOffset ts) => ts.ToString("yyyy-MM-dd HH:mm 'UTC'");

    private static string LoadLogoDataUri()
    {
        var assembly = typeof(EmailNotificationService).Assembly;
        var resourceName = assembly
            .GetManifestResourceNames()
            .FirstOrDefault(x => x.EndsWith("Email.Templates.Assets.dream_team_ever_logo.svg", StringComparison.OrdinalIgnoreCase));

        if (resourceName is null) 
            return string.Empty;

        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream is null) 
            return string.Empty;

        using var reader = new StreamReader(stream);
        var svg = reader.ReadToEnd();
        if (string.IsNullOrWhiteSpace(svg)) 
            return string.Empty;

        var bytes = System.Text.Encoding.UTF8.GetBytes(svg);
        return $"data:image/svg+xml;base64,{Convert.ToBase64String(bytes)}";
    }
}
