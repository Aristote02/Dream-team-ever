using System.ComponentModel.DataAnnotations;

namespace DreamTeamEver.Application.Dtos;

public record UpdateMyProfileRequest(
    [property: Required]
    [property: StringLength(200, MinimumLength = 2)]
    string FullName,
    [property: Required]
    [property: StringLength(32, MinimumLength = 6)]
    string Phone);
