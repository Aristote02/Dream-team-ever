using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Application.Common;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Application.Services;

public sealed class PaymentService : IPaymentService
{
    private readonly IMemberRepository _members;
    private readonly IPaymentTransactionRepository _payments;
    private readonly IMatriculeService _matricules;
    private readonly IStudentEnrollmentService _enrollment;
    private readonly IEmailNotificationService _emailNotifications;
    private readonly DreamTeamEverOptions _options;

    public PaymentService(
        IMemberRepository members,
        IPaymentTransactionRepository payments,
        IMatriculeService matricules,
        IStudentEnrollmentService enrollment,
        IEmailNotificationService emailNotifications,
        IOptions<DreamTeamEverOptions> options)
    {
        _members = members;
        _payments = payments;
        _matricules = matricules;
        _enrollment = enrollment;
        _emailNotifications = emailNotifications;
        _options = options.Value;
    }

    public async Task<PaymentTransaction?> InitiateAsync(Guid memberId, PaymentMethod method, CancellationToken cancellationToken = default)
    {
        var member = await _members.GetTrackedByIdAsync(memberId, cancellationToken);
        if (member is null)
            return null;

        var existingPending = await _payments.FindLatestPendingByMemberAsync(memberId, cancellationToken);
        if (existingPending is not null)
            return existingPending;

        var nextType = await _enrollment.GetNextPaymentTypeAsync(member, cancellationToken);
        if (nextType is null)
            return null;

        var tx = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            MemberId = memberId,
            Method = method,
            PaymentType = nextType.Value,
            Amount = _enrollment.GetFeeAmount(nextType.Value),
            Currency = _options.Currency,
            Status = PaymentStatus.Pending,
            ProviderReference = $"PENDING-{Guid.NewGuid():N}"[..24],
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await _payments.AddAsync(tx, cancellationToken);
        await _payments.SaveChangesAsync(cancellationToken);

        return tx;
    }

    public Task<PaymentTransaction?> GetTransactionAsync(Guid transactionId, CancellationToken cancellationToken = default) =>
        _payments.GetByIdWithMemberAsync(transactionId, cancellationToken);

    public async Task<IReadOnlyList<PaymentTransaction>> ListTransactionsByUserAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _payments.ListByUserCreatedDescAsync(userId, cancellationToken);

    public async Task<PaymentResult> ConfirmAsync(Guid transactionId, CancellationToken cancellationToken = default)
    {
        await using var dbTx = await _payments.BeginTransactionAsync(cancellationToken);

        var payment = await _payments.GetByIdWithMemberAsync(transactionId, cancellationToken);

        if (payment is null)
            return new PaymentResult(false, null, "Payment not found.");

        if (payment.Status == PaymentStatus.Completed)
        {
            await dbTx.CommitAsync(cancellationToken);
            return new PaymentResult(true, payment.Member.MatriculeCode, null);
        }

        if (payment.Status != PaymentStatus.Pending)
            return new PaymentResult(false, null, "Payment is not pending.");

        payment.Status = PaymentStatus.Completed;
        payment.CompletedAt = DateTimeOffset.UtcNow;
        payment.ProviderReference = $"OK-{Guid.NewGuid():N}"[..20];

        string? matricule = payment.Member.MatriculeCode;

        switch (payment.PaymentType)
        {
            case PaymentType.Registration:
                break;

            case PaymentType.ScolarFee:
                try
                {
                    matricule = string.IsNullOrEmpty(payment.Member.MatriculeCode)
                        ? await _matricules.TryIssueMatriculeAsync(payment.MemberId, cancellationToken)
                        : await _matricules.RegenerateMatriculeAsync(payment.MemberId, cancellationToken);
                }
                catch (Exception ex)
                {
                    await dbTx.RollbackAsync(cancellationToken);
                    return new PaymentResult(false, null, ex.Message);
                }

                await _enrollment.ExtendScolarFeeAsync(payment.Member, cancellationToken);
                break;

            default:
                await dbTx.RollbackAsync(cancellationToken);
                return new PaymentResult(false, null, "Unknown payment type.");
        }

        await _payments.SaveChangesAsync(cancellationToken);
        await dbTx.CommitAsync(cancellationToken);

        await NotifyPaymentConfirmedAsync(payment, cancellationToken);
        if (payment.PaymentType == PaymentType.ScolarFee && !string.IsNullOrWhiteSpace(matricule))
        {
            await NotifyMatriculeIssuedAsync(payment, matricule!, cancellationToken);
        }

        return new PaymentResult(true, matricule, null);
    }

    private async Task NotifyPaymentConfirmedAsync(PaymentTransaction payment, CancellationToken cancellationToken)
    {
        try
        {
            var email = payment.Member.User?.Email;
            if (string.IsNullOrWhiteSpace(email))
            {
                return;
            }

            await _emailNotifications.SendPaymentConfirmedAsync(
                new PaymentConfirmedNotification(
                    email,
                    payment.Member.FullName,
                    payment.Amount,
                    payment.Currency,
                    payment.CompletedAt ?? DateTimeOffset.UtcNow,
                    payment.ProviderReference),
                cancellationToken);
        }
        catch
        {
            // Do not break payment success for email failures.
        }
    }

    private async Task NotifyMatriculeIssuedAsync(PaymentTransaction payment, string matriculeCode, CancellationToken cancellationToken)
    {
        try
        {
            var email = payment.Member.User?.Email;
            if (string.IsNullOrWhiteSpace(email))
            {
                return;
            }

            await _emailNotifications.SendMatriculeIssuedAsync(
                new MatriculeIssuedNotification(
                    email,
                    payment.Member.FullName,
                    matriculeCode,
                    DateTimeOffset.UtcNow),
                cancellationToken);
        }
        catch
        {
            // Do not break payment success for email failures.
        }
    }
}
