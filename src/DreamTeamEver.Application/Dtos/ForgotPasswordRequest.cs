using System.ComponentModel.DataAnnotations;

namespace DreamTeamEver.Application.Dtos;

public record ForgotPasswordRequest(
    [property: Required]
    [property: EmailAddress]
    string Email);
