using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Api.Mapping;

public static class EntityMappings
{
    public static StudentDto ToStudentDto(this Student s) =>
        new(s.Id, s.UserId, s.FullName, s.User.Email, s.Phone, s.MatriculeCode, s.MatriculeIssuedAt, s.CreatedAt);

    public static PaymentTransactionDto ToPaymentDto(this PaymentTransaction p) =>
        new(p.Id, p.StudentId, p.Method, p.Amount, p.Currency, p.Status, p.ProviderReference, p.CreatedAt, p.CompletedAt, p.FailureReason);
}
