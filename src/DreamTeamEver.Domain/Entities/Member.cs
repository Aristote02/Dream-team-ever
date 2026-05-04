namespace DreamTeamEver.Domain.Entities;

public class Member
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public string FullName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    /// <summary>Official identifier issued after a successful registration payment (Mpesa flow).</summary>
    public string? MatriculeCode { get; set; }

    public DateTimeOffset? MatriculeIssuedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<PaymentTransaction> Payments { get; set; } = new List<PaymentTransaction>();
}
