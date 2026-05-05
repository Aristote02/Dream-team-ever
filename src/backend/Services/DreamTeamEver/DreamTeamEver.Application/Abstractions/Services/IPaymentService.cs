using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using DreamTeamEver.Application.Common;

namespace DreamTeamEver.Application.Abstractions;

public interface IPaymentService
{
    Task<PaymentTransaction?> InitiateAsync(Guid memberId, PaymentMethod method, CancellationToken cancellationToken = default);

    Task<PaymentTransaction?> GetTransactionAsync(Guid transactionId, CancellationToken cancellationToken = default);

    Task<PaymentResult> ConfirmAsync(Guid transactionId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PaymentTransaction>> ListTransactionsByMemberAsync(Guid memberId, CancellationToken cancellationToken = default);
}
