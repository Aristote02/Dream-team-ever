using DreamTeamEver.Api.Errors;
using Microsoft.AspNetCore.Mvc;

namespace DreamTeamEver.Api.Configuration;

public static class StatusCodePagesExtensions
{
	public static IApplicationBuilder UseProblemDetailsForStatusCodes(this IApplicationBuilder app)
	{
		app.UseStatusCodePages(async context =>
		{
			var httpContext = context.HttpContext;
			var response = httpContext.Response;

			if (response.HasStarted)
			{
				return;
			}

			if (response.StatusCode == StatusCodes.Status204NoContent || response.StatusCode == StatusCodes.Status304NotModified)
			{
				return;
			}

			var problemDetailsService = httpContext.RequestServices.GetRequiredService<IProblemDetailsService>();
			var (title, detail) = GetLocalizedProblemText(response.StatusCode);

			var pd = new ProblemDetails
			{
				Status = response.StatusCode,
				Title = title,
				Detail = detail,
				Type = "about:blank",
				Instance = httpContext.Request.Path
			};

			response.ContentType = "application/problem+json";
			await problemDetailsService.WriteAsync(new ProblemDetailsContext
			{
				HttpContext = httpContext,
				ProblemDetails = pd
			});
		});

		return app;
	}

	private static (string title, string? detail) GetLocalizedProblemText(int statusCode)
	{
		return statusCode switch
		{
			StatusCodes.Status400BadRequest => (
				ApiErrorText.Get(ApiErrorCode.ValidationFailedTitle),
				ApiErrorText.Get(ApiErrorCode.ValidationFailedDetail)),
			StatusCodes.Status401Unauthorized => (
				ApiErrorText.Get(ApiErrorCode.UnauthorizedTitle),
				ApiErrorText.Get(ApiErrorCode.UnauthorizedDetail)),
			StatusCodes.Status403Forbidden => (
				ApiErrorText.Get(ApiErrorCode.AccessDeniedTitle),
				ApiErrorText.Get(ApiErrorCode.ForbiddenDefaultDetail)),
			StatusCodes.Status404NotFound => (
				ApiErrorText.Get(ApiErrorCode.ResourceNotFoundTitle),
				ApiErrorText.Get(ApiErrorCode.ResourceNotFoundDetail)),
			StatusCodes.Status500InternalServerError => (
				ApiErrorText.Get(ApiErrorCode.UnexpectedErrorTitle),
				ApiErrorText.Get(ApiErrorCode.UnexpectedErrorDetail)),
			StatusCodes.Status501NotImplemented => (
				ApiErrorText.Get(ApiErrorCode.NotImplementedTitle),
				ApiErrorText.Get(ApiErrorCode.NotImplementedDetail)),
			_ => (
				ApiErrorText.Get(ApiErrorCode.UnexpectedErrorTitle),
				ApiErrorText.Get(ApiErrorCode.UnexpectedErrorDetail))
		};
	}
}