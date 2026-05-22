using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using DreamTeamEver.Application.Common;

namespace DreamTeamEver.Application.Abstractions;

public interface IPaymentService
{
    Task<PaymentTransaction?> InitiateAsync(Guid memberId, PaymentMethod method, CancellationToken cancellationToken = default);

    Task<PaymentTransaction?> GetTransactionAsync(Guid transactionId, CancellationToken cancellationToken = default);

    Task<PaymentResult> ConfirmAsync(Guid transactionId, CancellationToken cancellationToken = default);

    /// <summary>Completes or fails a pending payment from an M-Pesa async callback (idempotent).</summary>
    Task<PaymentResult> CompleteFromProviderAsync(Guid transactionId, string providerTransactionId, bool succeeded, string? providerMessage, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PaymentTransaction>> ListTransactionsByUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
