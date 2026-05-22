using DreamTeamEver.Domain.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace DreamTeamEver.Infrastructure.Email.Sending;

internal sealed class SendGridEmailSender : IEmailSender
{
    private readonly SendGridClient _sendGrid;
    private readonly EmailNotificationOptions _options;
    private readonly ILogger<SendGridEmailSender> _logger;

    public SendGridEmailSender(SendGridClient sendGrid, IOptions<EmailNotificationOptions> options, ILogger<SendGridEmailSender> logger)
    {
        _sendGrid = sendGrid;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var recipientMasked = MaskEmailForLog(toEmail);

        if (!_options.Enabled)
        {
            _logger.LogDebug("Email sending skipped because email notifications are disabled. Recipient: {RecipientMasked}, Subject: {EmailSubject}", recipientMasked, subject);
            
            return;
        }

        _logger.LogInformation("Sending email via SendGrid. Recipient: {RecipientMasked}, Subject: {EmailSubject}", recipientMasked, subject);

        var from = new EmailAddress(_options.SenderEmail, _options.SenderName);
        var to = new EmailAddress(toEmail);
        var message = MailHelper.CreateSingleEmail(from, to, subject, string.Empty, htmlBody);

        try
        {
            var response = await _sendGrid.SendEmailAsync(message, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                if (_logger.IsEnabled(LogLevel.Error))
                {
                    var body = await ReadResponseBodyAsync(response, cancellationToken);
                    _logger.LogError("SendGrid returned non-success status. Status: {StatusCode}, Recipient: {RecipientMasked}, Subject: {EmailSubject}, Body: {ResponseBody}",
                        (int)response.StatusCode, recipientMasked, subject, TruncateForLog(body, 800));
                }
                else
                {
                    _logger.LogError("SendGrid returned non-success status. Status: {StatusCode}, Recipient: {RecipientMasked}, Subject: {EmailSubject}", (int)response.StatusCode, recipientMasked, subject);
                }

                throw new InvalidOperationException($"SendGrid mail send failed with status {(int)response.StatusCode}.");
            }

            _logger.LogInformation("Email sent successfully via SendGrid. Recipient: {RecipientMasked}, Subject: {EmailSubject}", recipientMasked, subject);
        }
        catch (InvalidOperationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email via SendGrid. Recipient: {RecipientMasked}, Subject: {EmailSubject}", recipientMasked, subject);
            throw;
        }
    }

    private static string MaskEmailForLog(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return "(empty)";
        }

        var at = email.IndexOf('@');
        if (at <= 0 || at >= email.Length - 1)
        {
            return "***";
        }

        var local = email[..at];
        var domain = email[(at + 1)..];
        var prefix = local.Length <= 2 ? "**" : local[..2] + "***";
        return $"{prefix}@{domain}";
    }

    private static async Task<string> ReadResponseBodyAsync(Response response, CancellationToken cancellationToken)
    {
        try
        {
            return await response.Body.ReadAsStringAsync(cancellationToken);
        }
        catch
        {
            return string.Empty;
        }
    }

    private static string TruncateForLog(string value, int maxLength)
    {
        if (string.IsNullOrEmpty(value) || value.Length <= maxLength)
        {
            return value;
        }

        return value[..maxLength] + "…";
    }
}
