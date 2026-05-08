using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace DreamTeamEver.Infrastructure.Data.Repositories;

public sealed class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(DreamTeamEverDbContext context)
        : base(context)
    {
    }

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken) =>
        Query().AsNoTracking().AnyAsync(u => u.Email == email, cancellationToken);

    public Task<bool> AnyInRoleAsync(UserRole role, CancellationToken cancellationToken) =>
        Query().AsNoTracking().AnyAsync(u => u.Role == role, cancellationToken);

    public Task<User?> GetByEmailWithMemberProfileAsync(string email, CancellationToken cancellationToken) =>
        Query().AsNoTracking()
            .Include(u => u.MemberProfile)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public Task<User?> GetByEmailTrackedAsync(string email, CancellationToken cancellationToken) =>
        Query().FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public Task<User?> GetByIdTrackedAsync(Guid id, CancellationToken cancellationToken) =>
        Query().FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<User?> GetByIdWithMemberProfileTrackedAsync(Guid id, CancellationToken cancellationToken) =>
        Query()
            .Include(u => u.MemberProfile)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<List<User>> GetAllWithMemberProfileCreatedDescAsync(CancellationToken cancellationToken) =>
        Query().AsNoTracking()
            .Include(u => u.MemberProfile)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(cancellationToken);
}
