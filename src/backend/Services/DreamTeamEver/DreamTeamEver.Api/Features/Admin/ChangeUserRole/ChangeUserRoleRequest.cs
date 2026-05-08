using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Api.Features.Admin.ChangeUserRole;

public sealed record ChangeUserRoleRequest(Guid UserId, UserRole Role);
