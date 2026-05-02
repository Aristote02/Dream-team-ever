using DreamTeamEver.Application.Common;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Abstractions;

public interface IPaymentService
{
    Task<PaymentTransaction?> InitiateAsync(int studentId, PaymentMethod method, CancellationToken cancellationToken = default);

    Task<PaymentTransaction?> GetTransactionAsync(int transactionId, CancellationToken cancellationToken = default);

    Task<PaymentResult> ConfirmAsync(int transactionId, CancellationToken cancellationToken = default);
}
