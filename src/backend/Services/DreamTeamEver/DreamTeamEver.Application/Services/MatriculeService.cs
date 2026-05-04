using System.Security.Cryptography;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Services;

public sealed class MatriculeService : IMatriculeService
{
    private readonly IMemberRepository _members;

    public MatriculeService(IMemberRepository members) => _members = members;

    public async Task<string?> TryIssueMatriculeAsync(Guid memberId, CancellationToken cancellationToken = default)
    {
        await using var tx = await _members.BeginTransactionAsync(cancellationToken);

        var member = await _members.GetTrackedByIdAsync(memberId, cancellationToken);

        if (member is null)
            return null;

        if (!string.IsNullOrEmpty(member.MatriculeCode))
        {
            await tx.CommitAsync(cancellationToken);
            return member.MatriculeCode;
        }

        string code;
        var attempts = 0;
        do
        {
            code = $"DTE-{DateTimeOffset.UtcNow.Year}-{GenerateSuffix()}";
            attempts++;
            if (attempts > 32)
                throw new InvalidOperationException("Could not allocate a unique matricule.");
        } while (await _members.MatriculeCodeExistsAsync(code, cancellationToken));

        member.MatriculeCode = code;
        member.MatriculeIssuedAt = DateTimeOffset.UtcNow;
        await _members.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return code;
    }

    public Task<Member?> FindByMatriculeAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalized = code.Trim().ToUpperInvariant();
        return _members.FindByMatriculeCodeAsync(normalized, cancellationToken);
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
