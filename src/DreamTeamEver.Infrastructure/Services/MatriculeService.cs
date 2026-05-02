using System.Security.Cryptography;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DreamTeamEver.Infrastructure.Services;

public class MatriculeService : IMatriculeService
{
    private readonly AppDbContext _db;

    public MatriculeService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<string?> TryIssueMatriculeAsync(int studentId, CancellationToken cancellationToken = default)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);

        var student = await _db.Students
            .OrderBy(s => s.Id)
            .FirstOrDefaultAsync(s => s.Id == studentId, cancellationToken);

        if (student is null)
            return null;

        if (!string.IsNullOrEmpty(student.MatriculeCode))
        {
            await tx.CommitAsync(cancellationToken);
            return student.MatriculeCode;
        }

        string code;
        var attempts = 0;
        do
        {
            code = $"DTE-{DateTimeOffset.UtcNow.Year}-{GenerateSuffix()}";
            attempts++;
            if (attempts > 32)
                throw new InvalidOperationException("Could not allocate a unique matricule.");
        } while (await _db.Students.AnyAsync(s => s.MatriculeCode == code, cancellationToken));

        student.MatriculeCode = code;
        student.MatriculeIssuedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return code;
    }

    public Task<Student?> FindByMatriculeAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalized = code.Trim().ToUpperInvariant();
        return _db.Students.AsNoTracking()
            .FirstOrDefaultAsync(s => s.MatriculeCode == normalized, cancellationToken);
    }

    private static string GenerateSuffix()
    {
        Span<byte> bytes = stackalloc byte[8];
        RandomNumberGenerator.Fill(bytes);
        ulong n = BitConverter.ToUInt64(bytes);
        const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Span<char> chars = stackalloc char[6];
        for (var i = 0; i < 6; i++)
        {
            chars[i] = alphabet[(int)(n % (ulong)alphabet.Length)];
            n /= (ulong)alphabet.Length;
        }

        return new string(chars);
    }
}
