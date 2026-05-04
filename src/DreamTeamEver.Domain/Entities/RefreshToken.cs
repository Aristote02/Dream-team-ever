namespace DreamTeamEver.Domain.Entities;

public class RefreshToken
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public string TokenHash { get; set; } = string.Empty;

    public DateTimeOffset ExpiresAtUtc { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset? RevokedAtUtc { get; set; }
}
