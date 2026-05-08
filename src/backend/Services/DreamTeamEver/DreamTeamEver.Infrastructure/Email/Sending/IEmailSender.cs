namespace DreamTeamEver.Infrastructure.Email.Sending;

internal interface IEmailSender
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
}
