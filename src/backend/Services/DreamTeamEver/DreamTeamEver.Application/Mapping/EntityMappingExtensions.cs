using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Entities;
using Mapster;

namespace DreamTeamEver.Application.Mapping;

public static class EntityMappingExtensions
{
    public static MemberDto ToMemberDto(this Member member) => member.Adapt<MemberDto>();

    public static PaymentTransactionDto ToPaymentDto(this PaymentTransaction transaction) =>
        transaction.Adapt<PaymentTransactionDto>();
}
