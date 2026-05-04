using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Domain.Entities;

public class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; init; }

    public DateTimeOffset CreatedAt { get; init; }

    /// <summary>Present when <see cref="Role"/> is <see cref="UserRole.Member"/>.</summary>
    public Member? MemberProfile { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];

    public string? PasswordResetTokenHash { get; set; }

    public DateTimeOffset? PasswordResetExpiresAt { get; set; }
}
