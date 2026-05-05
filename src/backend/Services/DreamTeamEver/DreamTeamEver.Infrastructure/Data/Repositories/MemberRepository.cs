using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DreamTeamEver.Infrastructure.Data.Repositories;

public sealed class MemberRepository : Repository<Member>, IMemberRepository
{
    public MemberRepository(DreamTeamEverDbContext context)
        : base(context)
    {
    }

    public Task<Member?> GetByIdWithUserAsync(Guid memberId, CancellationToken cancellationToken) =>
        Query().AsNoTracking()
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.Id == memberId, cancellationToken);

    public Task<Member?> GetByUserIdWithUserAsync(Guid userId, CancellationToken cancellationToken) =>
        Query().AsNoTracking()
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

    public Task<Member?> GetTrackedByIdAsync(Guid memberId, CancellationToken cancellationToken) =>
        Query().FirstOrDefaultAsync(m => m.Id == memberId, cancellationToken);

    public Task<Member?> GetTrackedByUserIdAsync(Guid userId, CancellationToken cancellationToken) =>
        Query().FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

    public Task<bool> MatriculeCodeExistsAsync(string matriculeCode, CancellationToken cancellationToken) =>
        Query().AsNoTracking().AnyAsync(m => m.MatriculeCode == matriculeCode, cancellationToken);

    public Task<Member?> FindByMatriculeCodeAsync(string normalizedCode, CancellationToken cancellationToken) =>
        Query().AsNoTracking()
            .FirstOrDefaultAsync(m => m.MatriculeCode == normalizedCode, cancellationToken);

    public Task<List<Member>> GetAllWithUserCreatedDescAsync(CancellationToken cancellationToken) =>
        Query().AsNoTracking()
            .Include(m => m.User)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

    public Task<List<Member>> GetWithMatriculeOrderedAsync(CancellationToken cancellationToken) =>
        Query().AsNoTracking()
            .Include(m => m.User)
            .Where(m => m.MatriculeCode != null)
            .OrderByDescending(m => m.MatriculeIssuedAt)
            .ToListAsync(cancellationToken);
}
