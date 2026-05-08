using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Abstractions.Repositories;

public interface IPaymentTransactionRepository : IRepository<PaymentTransaction>
{
    Task<PaymentTransaction?> FindLatestPendingByMemberAsync(Guid memberId, CancellationToken cancellationToken = default);

    Task<PaymentTransaction?> GetByIdWithMemberAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<PaymentTransaction>> GetAllCreatedDescAsync(CancellationToken cancellationToken = default);

    Task<List<PaymentTransaction>> ListByUserCreatedDescAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<List<PaymentTransaction>> ListPendingCreatedBetweenWithMemberUserAsync(
        DateTimeOffset fromUtc,
        DateTimeOffset toUtc,
        CancellationToken cancellationToken = default);
}
