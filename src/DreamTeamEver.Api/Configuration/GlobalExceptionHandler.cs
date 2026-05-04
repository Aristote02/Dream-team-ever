using System.Diagnostics;
using DreamTeamEver.Api.Errors;
using DreamTeamEver.Api.Resources;
using DreamTeamEver.Domain.Options;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace DreamTeamEver.Api.Configuration;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
	private readonly IProblemDetailsService _problemDetailsService;
	private readonly ILogger<GlobalExceptionHandler> _logger;

	public GlobalExceptionHandler(IProblemDetailsService problemDetailsService, ILogger<GlobalExceptionHandler> logger)
	{
		_problemDetailsService = problemDetailsService;
		_logger = logger;
	}

	public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
	{
		if (exception is OptionsException)
		{
			_logger.LogError(exception, "Application configuration error: {Message}", exception.Message);
		}

		(var statusCode, var problem) = CreateProblemDetails(httpContext, exception);

		httpContext.Response.StatusCode = statusCode;
		httpContext.Response.ContentType = "application/problem+json";
		await _problemDetailsService.WriteAsync(new ProblemDetailsContext
		{
			HttpContext = httpContext,
			ProblemDetails = problem
		});
		return true;
	}

	private static (int statusCode, ProblemDetails problem) CreateProblemDetails(HttpContext httpContext, Exception exception)
	{
		ProblemDetails problemDetails;
		int statusCode;

		// FluentValidation exceptions (from FastEndpoints validators) are wrapped differently; handle typical cases
		if (exception is ValidationException validationException)
		{
			statusCode = StatusCodes.Status400BadRequest;
			var errors = validationException.Errors
				.GroupBy(e => e.PropertyName)
				.ToDictionary(g => g.Key, g => g.Select(e => LocalizeValidationErrorMessage(e.ErrorMessage)).ToArray());

			problemDetails = new ValidationProblemDetails(errors)
			{
				Title = ApiErrorText.Get(ApiErrorCode.ValidationFailedTitle),
				Detail = ApiErrorText.Get(ApiErrorCode.ValidationFailedDetail),
				Status = statusCode,
				Type = "https://datatracker.ietf.org/doc/html/rfc7807#section-3.1",
				Instance = httpContext.Request.Path
			};
		}
		else if (exception is ForbiddenAccessException forbidden)
		{
			statusCode = StatusCodes.Status403Forbidden;
			problemDetails = new ProblemDetails
			{
				Title = ApiErrorText.Get(ApiErrorCode.AccessDeniedTitle),
				Detail = string.IsNullOrWhiteSpace(forbidden.Message) ? ApiErrorText.Get(ApiErrorCode.ForbiddenDefaultDetail) : forbidden.Message,
				Status = statusCode,
				Type = "https://httpstatuses.io/403",
				Instance = httpContext.Request.Path
			};
		}
		else if (exception is NotFoundException notFound)
		{
			statusCode = StatusCodes.Status404NotFound;
			problemDetails = new ProblemDetails
			{
				Title = ApiErrorText.Get(ApiErrorCode.ResourceNotFoundTitle),
				Detail = string.IsNullOrWhiteSpace(notFound.Message) ? ApiErrorText.Get(ApiErrorCode.ResourceNotFoundDetail) : notFound.Message,
				Status = statusCode,
				Type = "https://httpstatuses.io/404",
				Instance = httpContext.Request.Path
			};
		}
		else if (exception is UnauthorizedAccessException unauthorized)
		{
			statusCode = StatusCodes.Status401Unauthorized;
			problemDetails = new ProblemDetails
			{
				Title = ApiErrorText.Get(ApiErrorCode.UnauthorizedTitle),
				Detail = string.IsNullOrWhiteSpace(unauthorized.Message) ? ApiErrorText.Get(ApiErrorCode.UnauthorizedDetail) : unauthorized.Message,
				Status = statusCode,
				Type = "https://httpstatuses.io/401",
				Instance = httpContext.Request.Path
			};
		}
		else if (exception is NotImplementedException notImplemented)
		{
			statusCode = StatusCodes.Status501NotImplemented;
			problemDetails = new ProblemDetails
			{
				Title = ApiErrorText.Get(ApiErrorCode.NotImplementedTitle),
				Detail = string.IsNullOrWhiteSpace(notImplemented.Message) ? ApiErrorText.Get(ApiErrorCode.NotImplementedDetail) : notImplemented.Message,
				Status = statusCode,
				Type = "https://httpstatuses.io/501",
				Instance = httpContext.Request.Path
			};
		}
		else if (exception is OptionsException)
		{
			statusCode = StatusCodes.Status500InternalServerError;
			problemDetails = new ProblemDetails
			{
				Title = ApiErrorText.Get(ApiErrorCode.ConfigurationErrorTitle),
				Detail = ApiErrorText.Get(ApiErrorCode.UnexpectedErrorDetail),
				Status = statusCode,
				Type = "https://httpstatuses.io/500",
				Instance = httpContext.Request.Path
			};
		}
		else
		{
			statusCode = StatusCodes.Status500InternalServerError;
			problemDetails = new ProblemDetails
			{
				Title = ApiErrorText.Get(ApiErrorCode.UnexpectedErrorTitle),
				Detail = ApiErrorText.Get(ApiErrorCode.UnexpectedErrorDetail),
				Status = statusCode,
				Type = "about:blank",
				Instance = httpContext.Request.Path
			};
		}

		problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? httpContext.TraceIdentifier;
		return (statusCode, problemDetails);
	}

	private static string LocalizeValidationErrorMessage(string errorMessage)
	{
		if (string.IsNullOrWhiteSpace(errorMessage))
		{
			return ApiErrorText.Get(ApiErrorCode.ValidationFailedDetail);
		}

		if (ApiErrorCatalog.ContainsCode(errorMessage))
		{
			return ApiErrorText.Get(errorMessage);
		}

		if (SharedResourceText.TryGet(errorMessage, out var localized))
		{
			return localized;
		}

		if (errorMessage.Contains('.', StringComparison.Ordinal))
		{
			return ApiErrorText.Get(ApiErrorCode.ValidationFailedDetail);
		}

		return errorMessage;
	}
}

public sealed class ForbiddenAccessException : Exception
{
	public ForbiddenAccessException(string message) : base(message) { }

	public ForbiddenAccessException() : base()
	{
	}

	public ForbiddenAccessException(string? message, Exception? innerException) : base(message, innerException)
	{
	}
}

public sealed class NotFoundException : Exception
{
	public NotFoundException(string message) : base(message) { }

	public NotFoundException() : base()
	{
	}

	public NotFoundException(string? message, Exception? innerException) : base(message, innerException)
	{
	}
}
