using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Common;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using DreamTeamEver.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;
    private readonly IMatriculeService _matricules;
    private readonly DreamTeamEverOptions _options;

    public PaymentService(
        AppDbContext db,
        IMatriculeService matricules,
        IOptions<DreamTeamEverOptions> options)
    {
        _db = db;
        _matricules = matricules;
        _options = options.Value;
    }

    public async Task<PaymentTransaction?> InitiateAsync(int studentId, PaymentMethod method, CancellationToken cancellationToken = default)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == studentId, cancellationToken);
        if (student is null || !string.IsNullOrEmpty(student.MatriculeCode))
            return null;

        var existingPending = await _db.PaymentTransactions
            .Where(p => p.StudentId == studentId && p.Status == PaymentStatus.Pending)
            .OrderByDescending(p => p.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingPending is not null)
            return existingPending;

        var tx = new PaymentTransaction
        {
            StudentId = studentId,
            Method = method,
            Amount = _options.RegistrationFee,
            Currency = _options.Currency,
            Status = PaymentStatus.Pending,
            ProviderReference = $"PENDING-{Guid.NewGuid():N}"[..24],
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.PaymentTransactions.Add(tx);
        await _db.SaveChangesAsync(cancellationToken);

        return tx;
    }

    public Task<PaymentTransaction?> GetTransactionAsync(int transactionId, CancellationToken cancellationToken = default)
    {
        return _db.PaymentTransactions
            .Include(p => p.Student)
            .FirstOrDefaultAsync(p => p.Id == transactionId, cancellationToken);
    }

    public async Task<PaymentResult> ConfirmAsync(int transactionId, CancellationToken cancellationToken = default)
    {
        await using var dbTx = await _db.Database.BeginTransactionAsync(cancellationToken);

        var payment = await _db.PaymentTransactions
            .Include(p => p.Student)
            .FirstOrDefaultAsync(p => p.Id == transactionId, cancellationToken);

        if (payment is null)
            return new PaymentResult(false, null, "Payment not found.");

        if (payment.Status == PaymentStatus.Completed)
        {
            await dbTx.CommitAsync(cancellationToken);
            return new PaymentResult(true, payment.Student.MatriculeCode, null);
        }

        if (payment.Status != PaymentStatus.Pending)
            return new PaymentResult(false, null, "Payment is not pending.");

        payment.Status = PaymentStatus.Completed;
        payment.CompletedAt = DateTimeOffset.UtcNow;
        payment.ProviderReference = $"OK-{Guid.NewGuid():N}"[..20];

        await _db.SaveChangesAsync(cancellationToken);

        string? matricule;
        try
        {
            matricule = await _matricules.TryIssueMatriculeAsync(payment.StudentId, cancellationToken);
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
