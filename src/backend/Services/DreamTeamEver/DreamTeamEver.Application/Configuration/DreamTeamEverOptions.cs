namespace DreamTeamEver.Application.Configuration;

public class DreamTeamEverOptions
{
    public const string SectionName = "DreamTeamEver";

    /// <summary>Registration fee in <see cref="Currency"/>.</summary>
    public decimal RegistrationFee { get; set; } = 50m;

    public string Currency { get; set; } = "USD";

    /// <summary>Allows simulated payment completion without provider callbacks (never enable in production).</summary>
    public bool AllowPaymentSimulation { get; set; }
}
