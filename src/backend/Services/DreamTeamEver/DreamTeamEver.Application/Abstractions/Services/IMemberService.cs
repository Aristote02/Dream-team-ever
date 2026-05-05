using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Abstractions;

public interface IMemberService
{
    Task<Member?> GetByIdAsync(Guid memberId, CancellationToken cancellationToken = default);

    Task<Member?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<Member?> UpdateMyProfileAsync(
        Guid userId,
        string fullName,
        string phone,
        CancellationToken cancellationToken = default);
}
