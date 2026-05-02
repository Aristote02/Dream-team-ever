using System.ComponentModel.DataAnnotations;
using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Dtos;

public record InitiatePaymentRequest(
    [property: Range(1, int.MaxValue)]
    int StudentId,
    [property: Required]
    PaymentMethod Method);
