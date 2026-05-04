using System.ComponentModel.DataAnnotations;
using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Dtos;

public record InitiatePaymentRequest(
    Guid MemberId,
    [property: Required]
    PaymentMethod Method);
