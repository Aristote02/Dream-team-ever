using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Dtos;

public record UserAccountDto(Guid Id, string Email, UserRole Role, DateTimeOffset CreatedAt, Guid? MemberId);
