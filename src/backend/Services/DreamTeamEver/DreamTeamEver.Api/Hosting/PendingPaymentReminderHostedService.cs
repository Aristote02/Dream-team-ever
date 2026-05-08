using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Options;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Api.Hosting;

internal sealed class PendingPaymentReminderHostedService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptions<EmailNotificationOptions> _emailOptions;
    private readonly ILogger<PendingPaymentReminderHostedService> _logger;

    public PendingPaymentReminderHostedService(
        IServiceScopeFactory scopeFactory,
        IOptions<EmailNotificationOptions> emailOptions,
        ILogger<PendingPaymentReminderHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _emailOptions = emailOptions;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingPaymentRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Pending payment reminder worker iteration failed.");
            }

            var delay = TimeSpan.FromMinutes(Math.Max(1, _emailOptions.Value.PendingReminderIntervalMinutes));
            await Task.Delay(delay, stoppingToken);
        }
    }

    private async Task ProcessPendingPaymentRemindersAsync(CancellationToken cancellationToken)
    {
        var options = _emailOptions.Value;
        if (!options.Enabled || !options.EnablePendingPaymentReminders)
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var toUtc = now.AddHours(-options.PendingReminderMinAgeHours);
        var fromUtc = toUtc.AddMinutes(-options.PendingReminderWindowMinutes);

        await using var scope = _scopeFactory.CreateAsyncScope();
        var payments = scope.ServiceProvider.GetRequiredService<IPaymentTransactionRepository>();
        var notifier = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();

        var pending = await payments.ListPendingCreatedBetweenWithMemberUserAsync(fromUtc, toUtc, cancellationToken);
        foreach (var tx in pending)
        {
            var email = tx.Member.User?.Email;
            if (string.IsNullOrWhiteSpace(email))
            {
                continue;
            }

            try
            {
                await notifier.SendPendingPaymentReminderAsync(
                    new PendingPaymentReminderNotification(
                        email,
                        tx.Member.FullName,
                        tx.Amount,
                        tx.Currency,
                        tx.CreatedAt,
                        tx.ProviderReference),
                    cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Pending payment reminder failed for payment {PaymentId}.", tx.Id);
            }
        }
    }
}
