using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace DreamTeamEver.Infrastructure.Data.Repositories;

public sealed class PaymentTransactionRepository : Repository<PaymentTransaction>, IPaymentTransactionRepository
{
    public PaymentTransactionRepository(DreamTeamEverDbContext context)
        : base(context)
    {
    }

    public Task<PaymentTransaction?> FindLatestPendingByMemberAsync(Guid memberId, CancellationToken cancellationToken) =>
        Query()
            .Where(p => p.MemberId == memberId && p.Status == PaymentStatus.Pending)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

    public Task<PaymentTransaction?> GetByIdWithMemberAsync(Guid id, CancellationToken cancellationToken) =>
        Query()
            .Include(p => p.Member)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public Task<List<PaymentTransaction>> GetAllCreatedDescAsync(CancellationToken cancellationToken) =>
        Query().AsNoTracking()
            .Include(p => p.Member)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

    public Task<List<PaymentTransaction>> ListByUserCreatedDescAsync(Guid userId, CancellationToken cancellationToken) =>
        Query().AsNoTracking()
            .Include(p => p.Member)
            .Where(p => p.Member.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
}
