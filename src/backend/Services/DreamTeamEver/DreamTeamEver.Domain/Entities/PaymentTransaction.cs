using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Domain.Entities;

public class PaymentTransaction
{
    public Guid Id { get; set; }

    public Guid MemberId { get; set; }

    public Member Member { get; set; } = null!;

    public PaymentMethod Method { get; set; }

    public PaymentType PaymentType { get; set; }

    public decimal Amount { get; set; }

    public string Currency { get; set; } = "USD";

    public PaymentStatus Status { get; set; }

    public string? ProviderReference { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public string? FailureReason { get; set; }
}
