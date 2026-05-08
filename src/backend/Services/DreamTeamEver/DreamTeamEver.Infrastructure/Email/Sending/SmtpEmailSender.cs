using DreamTeamEver.Domain.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace DreamTeamEver.Infrastructure.Email.Sending;

internal sealed class SmtpEmailSender : IEmailSender
{
    private readonly EmailNotificationOptions _options;

    public SmtpEmailSender(IOptions<EmailNotificationOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
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
        await smtp.ConnectAsync(_options.SmtpHost, _options.SmtpPort, socketOptions, cancellationToken);
        await smtp.AuthenticateAsync(_options.SmtpUsername, _options.SmtpPassword, cancellationToken);
        await smtp.SendAsync(message, cancellationToken);
        await smtp.DisconnectAsync(true, cancellationToken);
    }
}
