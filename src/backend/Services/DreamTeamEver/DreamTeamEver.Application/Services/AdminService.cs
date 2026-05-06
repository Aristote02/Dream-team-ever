using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Contracts.Pagination;
using Mapster;

namespace DreamTeamEver.Application.Services;

public sealed class AdminService : IAdminService
{
    private readonly IUserRepository _users;
    private readonly IMemberRepository _members;
    private readonly IPaymentTransactionRepository _payments;

    public AdminService(
        IUserRepository users,
        IMemberRepository members,
        IPaymentTransactionRepository payments)
    {
        _users = users;
        _members = members;
        _payments = payments;
    }

    public async Task<IReadOnlyList<UserAccountDto>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _users.GetAllWithMemberProfileCreatedDescAsync(cancellationToken);
        return users.Adapt<List<UserAccountDto>>();
    }

    public async Task<IReadOnlyList<MemberSummaryDto>> GetAllMembersAsync(CancellationToken cancellationToken = default)
    {
        var members = await _members.GetAllWithUserCreatedDescAsync(cancellationToken);
        return members.Adapt<List<MemberSummaryDto>>();
    }

    public async Task<IReadOnlyList<MemberSummaryDto>> GetMembersWithMatriculeAsync(CancellationToken cancellationToken = default)
    {
        var members = await _members.GetWithMatriculeOrderedAsync(cancellationToken);
        return members.Adapt<List<MemberSummaryDto>>();
    }

    public async Task<IReadOnlyList<PaymentTransactionDto>> GetAllPaymentsAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _payments.GetAllCreatedDescAsync(cancellationToken);
        return rows.Adapt<List<PaymentTransactionDto>>();
    }

    public async Task<PagedResult<PaymentTransactionDto>> GetPaymentsPagedAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var safePage = Math.Max(1, pageNumber);
        var safeSize = Math.Clamp(pageSize, 1, 200);

        var paged = await _payments.GetPagedAsync(
            safePage,
            safeSize,
            _ => true,
            q => q.OrderByDescending(p => p.CreatedAt),
            cancellationToken,
            asNoTracking: true,
            p => p.Member);

        return new PagedResult<PaymentTransactionDto>
        {
            Items = (paged.Items ?? []).Adapt<List<PaymentTransactionDto>>(),
            PageNumber = paged.PageNumber,
            PageSize = paged.PageSize,
            TotalCount = paged.TotalCount,
        };
    }

    public async Task<bool> DeleteUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdTrackedAsync(userId, cancellationToken);
        if (user is null)
            return false;

        await _users.DeleteAsync(user, cancellationToken);
        await _users.SaveChangesAsync(cancellationToken);
        return true;
    }
}
