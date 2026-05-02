using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using DreamTeamEver.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DreamTeamEver.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IJwtTokenGenerator _jwt;

    public AuthService(AppDbContext db, IPasswordHasher<User> passwordHasher, IJwtTokenGenerator jwt)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwt = jwt;
    }

    public async Task<AuthResponse?> RegisterStudentAsync(RegisterStudentRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim();
        if (await _db.Users.AnyAsync(u => u.Email == email, cancellationToken))
            return null;

        var user = new User
        {
            Email = email,
            Role = UserRole.Student,
            CreatedAt = DateTimeOffset.UtcNow
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        var student = new Student
        {
            UserId = user.Id,
            FullName = request.FullName.Trim(),
            Phone = request.Phone.Trim(),
            CreatedAt = DateTimeOffset.UtcNow
        };
        _db.Students.Add(student);
        await _db.SaveChangesAsync(cancellationToken);

        var (token, exp) = _jwt.CreateAccessToken(user, student.Id);
        return new AuthResponse(token, exp, user.Email, user.Role.ToString(), user.Id, student.Id);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim();
        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user is null)
            return null;

        var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
            return null;

        int? studentId = user.StudentProfile?.Id;
        var (token, exp) = _jwt.CreateAccessToken(user, studentId);
        return new AuthResponse(token, exp, user.Email, user.Role.ToString(), user.Id, studentId);
    }
}
