using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Abstractions;

public interface IMemberService
{
    Task<Member?> GetByIdAsync(Guid memberId, CancellationToken cancellationToken = default);

    Task<Member?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
