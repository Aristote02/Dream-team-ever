using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Entities;
using Mapster;

namespace DreamTeamEver.Application.Mapping;

/// <summary>Central Mapster rules for domain entities to application DTOs.</summary>
public sealed class DreamTeamEverMappingRegister : IRegister
{
    private static int _applied;

    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<User, UserAccountDto>()
            .Map(dest => dest.MemberId, src => src.MemberProfile == null ? (Guid?)null : src.MemberProfile.Id);

        config.NewConfig<Member, MemberSummaryDto>()
            .Map(dest => dest.MemberId, src => src.Id)
            .Map(dest => dest.Email, src => src.User.Email)
            .Map(dest => dest.Role, src => src.User.Role);

        config.NewConfig<PaymentTransaction, PaymentTransactionDto>()
            .Map(dest => dest.MemberFullName, src => src.Member == null ? null : src.Member.FullName);
    }

    /// <summary>Registers mappings on the global config (idempotent for repeated host setup).</summary>
    public static void ApplyGlobal()
    {
        if (Interlocked.Exchange(ref _applied, 1) != 0)
            return;

        new DreamTeamEverMappingRegister().Register(TypeAdapterConfig.GlobalSettings);
        MpesaMappingRegister.ApplyGlobal();
    }
}
