using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Entities;
using Mapster;

namespace DreamTeamEver.Application.Mapping;

public static class EntityMappingExtensions
{
    public static MemberDto ToMemberDto(this Member member, MemberEnrollmentStatusDto enrollment) =>
        new(
            member.Id,
            member.UserId,
            member.FullName,
            member.User.Email,
            member.Phone,
            member.MatriculeCode,
            member.MatriculeIssuedAt,
            enrollment.ScolarFeeExpiresAt,
            enrollment.RegistrationFeePaid,
            enrollment.ScolarFeeActive,
            enrollment.NextPaymentType,
            enrollment.NextPaymentAmount,
            enrollment.Currency,
            member.CreatedAt);

    public static PaymentTransactionDto ToPaymentDto(this PaymentTransaction transaction) =>
        transaction.Adapt<PaymentTransactionDto>();
}
