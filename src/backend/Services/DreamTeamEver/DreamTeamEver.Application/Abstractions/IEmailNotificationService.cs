using DreamTeamEver.Application.Dtos;

namespace DreamTeamEver.Application.Abstractions;

public interface IEmailNotificationService
{
    Task SendWelcomeAsync(WelcomeNotification notification, CancellationToken cancellationToken = default);
    Task SendPasswordResetAsync(PasswordResetNotification notification, CancellationToken cancellationToken = default);
    Task SendPasswordChangedAsync(PasswordChangedNotification notification, CancellationToken cancellationToken = default);
    Task SendLoginAlertAsync(LoginAlertNotification notification, CancellationToken cancellationToken = default);
    Task SendPaymentConfirmedAsync(PaymentConfirmedNotification notification, CancellationToken cancellationToken = default);
    Task SendMatriculeIssuedAsync(MatriculeIssuedNotification notification, CancellationToken cancellationToken = default);
    Task SendAccountDeletedAsync(AccountDeletedNotification notification, CancellationToken cancellationToken = default);
    Task SendRoleChangedAsync(RoleChangedNotification notification, CancellationToken cancellationToken = default);
    Task SendPendingPaymentReminderAsync(PendingPaymentReminderNotification notification, CancellationToken cancellationToken = default);
}
