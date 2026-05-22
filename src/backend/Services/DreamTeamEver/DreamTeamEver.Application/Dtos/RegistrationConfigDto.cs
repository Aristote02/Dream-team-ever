namespace DreamTeamEver.Application.Dtos;

public record RegistrationConfigDto(
    decimal RegistrationFee,
    decimal ScolarFee,
    int ScolarFeeValidityDays,
    string Currency,
    bool AllowPaymentSimulation,
    bool MpesaEnabled);
