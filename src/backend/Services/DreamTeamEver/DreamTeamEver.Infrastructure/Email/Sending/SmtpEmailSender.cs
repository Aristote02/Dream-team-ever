using DreamTeamEver.Domain.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace DreamTeamEver.Infrastructure.Email.Sending;

internal sealed class SmtpEmailSender : IEmailSender
{
    private readonly EmailNotificationOptions _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<EmailNotificationOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            _logger.LogDebug("Email sending skipped because email notifications are disabled. Recipient: {RecipientEmail}, Subject: {EmailSubject}",
                toEmail, subject);
            
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.SenderName, _options.SenderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = htmlBody
        };

        message.Body = bodyBuilder.ToMessageBody();

        using var smtp = new SmtpClient();
        var socketOptions = _options.UseSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;

        _logger.LogInformation(
            "Sending email via SMTP. Host: {SmtpHost}, Port: {SmtpPort}, Security: {SocketOptions}, Recipient: {RecipientEmail}, Subject: {EmailSubject}",
            _options.SmtpHost,
            _options.SmtpPort,
            socketOptions,
            toEmail,
            subject);

        try
        {
            await smtp.ConnectAsync(_options.SmtpHost, _options.SmtpPort, socketOptions, cancellationToken);
            await smtp.AuthenticateAsync(_options.SmtpUsername, _options.SmtpPassword, cancellationToken);
            await smtp.SendAsync(message, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email sent successfully. Recipient: {RecipientEmail}, Subject: {EmailSubject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to send email via SMTP. Host: {SmtpHost}, Port: {SmtpPort}, Security: {SocketOptions}, Recipient: {RecipientEmail}, Subject: {EmailSubject}",
                _options.SmtpHost,
                _options.SmtpPort,
                socketOptions,
                toEmail,
                subject);
            throw;
        }
    }
}
