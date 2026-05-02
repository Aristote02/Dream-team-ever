using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DreamTeamEver.Infrastructure.Services;

public class StudentService : IStudentService
{
    private readonly AppDbContext _db;

    public StudentService(AppDbContext db)
    {
        _db = db;
    }

    public Task<Student?> GetByIdAsync(int studentId, CancellationToken cancellationToken = default)
    {
        return _db.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == studentId, cancellationToken);
    }

    public Task<Student?> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return _db.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
    }
}
