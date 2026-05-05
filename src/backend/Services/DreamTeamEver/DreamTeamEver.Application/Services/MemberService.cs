using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Services;

public sealed class MemberService : IMemberService
{
    private readonly IMemberRepository _members;

    public MemberService(IMemberRepository members) => _members = members;

    public Task<Member?> GetByIdAsync(Guid memberId, CancellationToken cancellationToken = default) =>
        _members.GetByIdWithUserAsync(memberId, cancellationToken);

    public Task<Member?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        _members.GetByUserIdWithUserAsync(userId, cancellationToken);

    public async Task<Member?> UpdateMyProfileAsync(
        Guid userId,
        string fullName,
        string phone,
        CancellationToken cancellationToken = default)
    {
        var me = await _members.GetTrackedByUserIdAsync(userId, cancellationToken);
        if (me is null)
            return null;

        me.FullName = fullName.Trim();
        me.Phone = phone.Trim();
        await _members.SaveChangesAsync(cancellationToken);

        return await _members.GetByUserIdWithUserAsync(userId, cancellationToken);
    }
}
