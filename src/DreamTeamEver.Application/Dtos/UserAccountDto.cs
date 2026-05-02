using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Dtos;

public record UserAccountDto(int Id, string Email, UserRole Role, DateTimeOffset CreatedAt, int? StudentId);
