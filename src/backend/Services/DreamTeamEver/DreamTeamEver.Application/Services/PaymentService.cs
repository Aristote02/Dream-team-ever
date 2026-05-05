using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Application.Common;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Application.Services;

public sealed class PaymentService : IPaymentService
{
    private readonly IMemberRepository _members;
    private readonly IPaymentTransactionRepository _payments;
    private readonly IMatriculeService _matricules;
    private readonly DreamTeamEverOptions _options;

    public PaymentService(
        IMemberRepository members,
        IPaymentTransactionRepository payments,
        IMatriculeService matricules,
        IOptions<DreamTeamEverOptions> options)
    {
        _members = members;
        _payments = payments;
        _matricules = matricules;
        _options = options.Value;
    }

    public async Task<PaymentTransaction?> InitiateAsync(Guid memberId, PaymentMethod method, CancellationToken cancellationToken = default)
    {
        var member = await _members.GetTrackedByIdAsync(memberId, cancellationToken);
        if (member is null || !string.IsNullOrEmpty(member.MatriculeCode))
            return null;

        var existingPending = await _payments.FindLatestPendingByMemberAsync(memberId, cancellationToken);
        if (existingPending is not null)
            return existingPending;

        var tx = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            MemberId = memberId,
            Method = method,
            Amount = _options.RegistrationFee,
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


    public async Task<IReadOnlyList<PaymentTransaction>> ListTransactionsByUserAsync(Guid userId, CancellationToken cancellationToken = default) => await _payments.ListByUserCreatedDescAsync(userId, cancellationToken);

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

        await _payments.SaveChangesAsync(cancellationToken);

        string? matricule;
        try
        {
            matricule = await _matricules.TryIssueMatriculeAsync(payment.MemberId, cancellationToken);
        }
        catch (Exception ex)
        {
            await dbTx.RollbackAsync(cancellationToken);
            return new PaymentResult(false, null, ex.Message);
        }

        await dbTx.CommitAsync(cancellationToken);
        return new PaymentResult(true, matricule, null);
    }
}
