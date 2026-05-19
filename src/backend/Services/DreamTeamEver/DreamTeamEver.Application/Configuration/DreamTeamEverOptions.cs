namespace DreamTeamEver.Application.Configuration;

public class DreamTeamEverOptions
{
    public const string SectionName = "DreamTeamEver";

    /// <summary>One-time registration fee in <see cref="Currency"/>.</summary>
    public decimal RegistrationFee { get; set; } = 10m;

    /// <summary>Scolar fee per period in <see cref="Currency"/> (initial and renewals).</summary>
    public decimal ScolarFee { get; set; } = 50m;

    /// <summary>Days each completed scolar-fee payment extends membership.</summary>
    public int ScolarFeeValidityDays { get; set; } = 30;

    public string Currency { get; set; } = "USD";

    /// <summary>Allows simulated payment completion without provider callbacks (never enable in production).</summary>
    public bool AllowPaymentSimulation { get; set; }
}
