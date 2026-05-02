using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DreamTeamEver.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<UserAccountDto>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Users
            .AsNoTracking()
            .Include(u => u.StudentProfile)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserAccountDto(
                u.Id,
                u.Email,
                u.Role,
                u.CreatedAt,
                u.StudentProfile != null ? u.StudentProfile.Id : null))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StudentSummaryDto>> GetAllStudentsAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Students
            .AsNoTracking()
            .Include(s => s.User)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new StudentSummaryDto(
                s.Id,
                s.UserId,
                s.FullName,
                s.User.Email,
                s.Phone,
                s.MatriculeCode,
                s.MatriculeIssuedAt,
                s.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StudentSummaryDto>> GetStudentsWithMatriculeAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Students
            .AsNoTracking()
            .Include(s => s.User)
            .Where(s => s.MatriculeCode != null)
            .OrderByDescending(s => s.MatriculeIssuedAt)
            .Select(s => new StudentSummaryDto(
                s.Id,
                s.UserId,
                s.FullName,
                s.User.Email,
                s.Phone,
                s.MatriculeCode,
                s.MatriculeIssuedAt,
                s.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PaymentTransactionDto>> GetAllPaymentsAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _db.PaymentTransactions
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        return rows.Select(p => new PaymentTransactionDto(
            p.Id,
            p.StudentId,
            p.Method,
            p.Amount,
            p.Currency,
            p.Status,
            p.ProviderReference,
            p.CreatedAt,
            p.CompletedAt,
            p.FailureReason)).ToList();
    }

    public async Task<bool> DeleteUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
            return false;

        _db.Users.Remove(user);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
