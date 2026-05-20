namespace DreamTeamEver.Domain.Entities;

public class Member
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public string FullName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    /// <summary>Official identifier issued on first scolar fee and regenerated on each renewal.</summary>
    public string? MatriculeCode { get; set; }

    public DateTimeOffset? MatriculeIssuedAt { get; set; }

    /// <summary>
    /// UTC timestamp when the current school fee period expires. Extended on each renewal.
    /// </summary>
    public DateTimeOffset? ScolarFeeExpiresAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<PaymentTransaction> Payments { get; set; } = new List<PaymentTransaction>();
}
