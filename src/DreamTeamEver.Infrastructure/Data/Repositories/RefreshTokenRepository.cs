using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DreamTeamEver.Infrastructure.Data.Repositories;

public sealed class RefreshTokenRepository : Repository<RefreshToken>, IRefreshTokenRepository
{
    public RefreshTokenRepository(DreamTeamEverDbContext context)
        : base(context)
    {
    }

    public Task<RefreshToken?> FindActiveByTokenHashWithUserAsync(string tokenHash, CancellationToken cancellationToken) =>
        Query()
            .Include(t => t.User)
            .ThenInclude(u => u.MemberProfile)
            .FirstOrDefaultAsync(
                t => t.TokenHash == tokenHash && t.RevokedAtUtc == null && t.ExpiresAtUtc > DateTimeOffset.UtcNow,
                cancellationToken);

    public async Task<IReadOnlyList<RefreshToken>> ListActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken) =>
        await Query()
            .Where(t => t.UserId == userId && t.RevokedAtUtc == null)
            .ToListAsync(cancellationToken);
}
