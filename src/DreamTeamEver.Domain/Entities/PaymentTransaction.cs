using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Domain.Entities;

public class PaymentTransaction
{
    public int Id { get; set; }

    public int StudentId { get; set; }

    public Student Student { get; set; } = null!;

    public PaymentMethod Method { get; set; }

    public decimal Amount { get; set; }

    public string Currency { get; set; } = "USD";

    public PaymentStatus Status { get; set; }

    public string? ProviderReference { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public string? FailureReason { get; set; }
}
