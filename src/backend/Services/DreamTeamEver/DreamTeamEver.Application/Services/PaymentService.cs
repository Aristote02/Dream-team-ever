using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Abstractions.Payments;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Application.Common;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Constants;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Application.Dtos.Mpesa;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using Mapster;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Application.Services;

public sealed class PaymentService : IPaymentService
{
    private readonly IMemberRepository _members;
    private readonly IPaymentTransactionRepository _payments;
    private readonly IMatriculeService _matricules;
    private readonly IStudentEnrollmentService _enrollment;
    private readonly IEmailNotificationService _emailNotifications;
    private readonly IMpesaPaymentGateway _mpesa;
    private readonly DreamTeamEverOptions _options;
    private readonly MpesaOptions _mpesaOptions;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        IMemberRepository members,
        IPaymentTransactionRepository payments,
        IMatriculeService matricules,
        IStudentEnrollmentService enrollment,
        IEmailNotificationService emailNotifications,
        IMpesaPaymentGateway mpesa,
        IOptions<DreamTeamEverOptions> options,
        IOptions<MpesaOptions> mpesaOptions,
        ILogger<PaymentService> logger)
    {
        _members = members;
        _payments = payments;
        _matricules = matricules;
        _enrollment = enrollment;
        _emailNotifications = emailNotifications;
        _mpesa = mpesa;
        _options = options.Value;
        _mpesaOptions = mpesaOptions.Value;
        _logger = logger;
    }

    public async Task<PaymentTransaction?> InitiateAsync(Guid memberId, PaymentMethod method, CancellationToken cancellationToken = default)
    {
        var member = await _members.GetTrackedByIdAsync(memberId, cancellationToken);
        if (member is null)
        {
            return null;
        }

        var existingPending = await _payments.FindLatestPendingByMemberAsync(memberId, cancellationToken);
        if (existingPending is not null)
        {
            return existingPending;
        }

        var nextType = await _enrollment.GetNextPaymentTypeAsync(member, cancellationToken);
        if (nextType is null)
        {
            return null;
        }

        var tx = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            MemberId = memberId,
            Method = method,
            PaymentType = nextType.Value,
            Amount = _enrollment.GetFeeAmount(nextType.Value),
            Currency = _options.Currency,
            Status = PaymentStatus.Pending,
            ProviderReference = null,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await _payments.AddAsync(tx, cancellationToken);
        await _payments.SaveChangesAsync(cancellationToken);

        if (method == PaymentMethod.Mpesa)
        {
            await InitiateMpesaAsync(member, tx, cancellationToken);
            await _payments.SaveChangesAsync(cancellationToken);
        }

        return tx;
    }

    public Task<PaymentTransaction?> GetTransactionAsync(Guid transactionId, CancellationToken cancellationToken = default) =>
        _payments.GetByIdWithMemberAsync(transactionId, cancellationToken);

    public async Task<IReadOnlyList<PaymentTransaction>> ListTransactionsByUserAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _payments.ListByUserCreatedDescAsync(userId, cancellationToken);

    public async Task<PaymentResult> ConfirmAsync(Guid transactionId, CancellationToken cancellationToken = default)
    {
        var payment = await _payments.GetByIdWithMemberAsync(transactionId, cancellationToken);
        if (payment is null)
        {
            return new PaymentResult(false, null, PaymentErrorMessages.NotFound);
        }

        if (payment.Status == PaymentStatus.Completed)
        {
            return new PaymentResult(true, payment.Member.MatriculeCode, null);
        }

        if (payment.Status != PaymentStatus.Pending)
        {
            return new PaymentResult(false, null, PaymentErrorMessages.NotPending);
        }

        var simulatedReference =
            $"{PaymentSimulationReference.Prefix}{Guid.NewGuid():N}"[..PaymentSimulationReference.MaxLength];

        return await CompleteSuccessfulPaymentAsync(payment, simulatedReference, cancellationToken);
    }

    public async Task<PaymentResult> CompleteFromProviderAsync(Guid transactionId, string providerTransactionId, bool succeeded, string? providerMessage, CancellationToken cancellationToken = default)
    {
        var payment = await _payments.GetByIdWithMemberAsync(transactionId, cancellationToken);
        if (payment is null)
        {
            return new PaymentResult(false, null, PaymentErrorMessages.NotFound);
        }

        if (payment.Status == PaymentStatus.Completed)
        {
            return new PaymentResult(true, payment.Member.MatriculeCode, null);
        }

        if (payment.Status != PaymentStatus.Pending)
        {
            return new PaymentResult(false, null, PaymentErrorMessages.NotPending);
        }

        if (!succeeded)
        {
            payment.Status = PaymentStatus.Failed;
            payment.FailureReason = providerMessage ?? MpesaPaymentMessages.DeclinedByProvider;
            payment.CompletedAt = DateTimeOffset.UtcNow;
            
            await _payments.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Payment {PaymentId} failed via M-Pesa callback: {Reason}", transactionId, payment.FailureReason);
            
            return new PaymentResult(false, null, payment.FailureReason);
        }

        return await CompleteSuccessfulPaymentAsync(payment, providerTransactionId, cancellationToken);
    }

    private async Task InitiateMpesaAsync(Member member, PaymentTransaction tx, CancellationToken cancellationToken)
    {
        if (!_mpesaOptions.Enabled)
        {
            tx.FailureReason = MpesaPaymentMessages.NotConfigured;
            tx.Status = PaymentStatus.Failed;
            tx.CompletedAt = DateTimeOffset.UtcNow;
            
            return;
        }

        if (!MpesaMsisdnNormalizer.TryNormalize(member.Phone, out var msisdn, out var phoneError))
        {
            tx.FailureReason = phoneError;
            tx.Status = PaymentStatus.Failed;
            tx.CompletedAt = DateTimeOffset.UtcNow;
            
            return;
        }

        var currency = string.IsNullOrWhiteSpace(_mpesaOptions.Currency)
            ? _options.Currency
            : _mpesaOptions.Currency;

        var initiationContext = new MpesaPaymentInitiationContext
        {
            Transaction = tx,
            CustomerMsisdn = msisdn,
            Currency = currency,
            CountryCode = _mpesaOptions.Country,
        };

        var mpesaRequest = initiationContext.ToMpesaC2BRequestDto();
        var result = await _mpesa.InitiateC2BAsync(mpesaRequest, cancellationToken);
        if (!result.Succeeded)
        {
            tx.Status = PaymentStatus.Failed;
            tx.FailureReason = result.ErrorMessage ?? result.ResponseDescription ?? MpesaPaymentMessages.InitiationFailed;
            tx.CompletedAt = DateTimeOffset.UtcNow;
            _logger.LogWarning("M-Pesa initiation failed for payment {PaymentId}: {Reason}", tx.Id, tx.FailureReason);
            
            return;
        }

        tx.ProviderReference = result.ConversationId;
        tx.FailureReason = null;
        _logger.LogInformation("M-Pesa C2B accepted for payment {PaymentId}, conversation {ConversationId}.", tx.Id, result.ConversationId);
    }

    private async Task<PaymentResult> CompleteSuccessfulPaymentAsync(PaymentTransaction payment, string providerTransactionId, CancellationToken cancellationToken)
    {
        payment.Status = PaymentStatus.Completed;
        payment.CompletedAt = DateTimeOffset.UtcNow;
        payment.ProviderReference = providerTransactionId;
        payment.FailureReason = null;

        var matricule = payment.Member.MatriculeCode;

        switch (payment.PaymentType)
        {
            case PaymentType.Registration:
                break;

            case PaymentType.ScolarFee:
                try
                {
                    matricule = string.IsNullOrEmpty(payment.Member.MatriculeCode)
                        ? await _matricules.TryIssueMatriculeAsync(payment.MemberId, cancellationToken)
                        : await _matricules.RegenerateMatriculeAsync(payment.MemberId, cancellationToken);
                }
                catch (Exception ex)
                {
                    return new PaymentResult(false, null, ex.Message);
                }

                await _enrollment.ExtendScolarFeeAsync(payment.Member, cancellationToken);
                break;

            default:
                return new PaymentResult(false, null, PaymentErrorMessages.UnknownPaymentType);
        }

        await _payments.SaveChangesAsync(cancellationToken);

        await NotifyPaymentConfirmedAsync(payment, cancellationToken);
        if (payment.PaymentType == PaymentType.ScolarFee && !string.IsNullOrWhiteSpace(matricule))
        {
            await NotifyMatriculeIssuedAsync(payment, matricule!, cancellationToken);
        }

        return new PaymentResult(true, matricule, null);
    }

    private async Task NotifyPaymentConfirmedAsync(PaymentTransaction payment, CancellationToken cancellationToken)
    {
        try
        {
            var email = payment.Member.User?.Email;
            if (string.IsNullOrWhiteSpace(email))
            {
                return;
            }

            await _emailNotifications.SendPaymentConfirmedAsync(
                payment.Adapt<PaymentConfirmedNotification>(),
                cancellationToken);
        }
        catch
        {
            // Do not break payment success for email failures.
        }
    }

    private async Task NotifyMatriculeIssuedAsync(PaymentTransaction payment, string matriculeCode, CancellationToken cancellationToken)
    {
        try
        {
            var email = payment.Member.User?.Email;
            if (string.IsNullOrWhiteSpace(email))
            {
                return;
            }

            await _emailNotifications.SendMatriculeIssuedAsync(payment.ToMatriculeIssuedNotification(matriculeCode), cancellationToken);
        }
        catch
        {
            // Do not break payment success for email failures.
        }
    }
}
