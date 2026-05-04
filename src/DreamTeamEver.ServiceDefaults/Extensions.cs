using System.Linq.Expressions;
using DreamTeamEver.Domain.Options;
using DreamTeamEver.Domain.Options.Validators;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyModel;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Settings.Configuration;

namespace DreamTeamEver.ServiceDefaults;

// Adds common Aspire services: service discovery, resilience, health checks, and OpenTelemetry.
// This project should be referenced by each service project in your solution.
// To learn more about using this project, see https://aka.ms/dotnet/aspire/service-defaults
public static class Extensions
{
	private const string HealthEndpointPath = "/health";
	private const string AlivenessEndpointPath = "/alive";

	public static TBuilder AddServiceDefaults<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
	{
		builder.ConfigureOpenTelemetry();

		builder.AddDefaultHealthChecks();

		builder.Services.AddServiceDiscovery();

		builder.Services.ConfigureHttpClientDefaults(http =>
		{
			// Turn on resilience by default
			http.AddStandardResilienceHandler();

			// Turn on service discovery by default
			http.AddServiceDiscovery();
		});
		
		builder.AddSerilogLogger();

		return builder;
	}

	public static TBuilder ConfigureOpenTelemetry<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
	{
		builder.Logging.AddOpenTelemetry(logging =>
		{
			logging.IncludeFormattedMessage = true;
			logging.IncludeScopes = true;
		});

		builder.Services.AddOpenTelemetry()
			.WithMetrics(metrics =>
			{
				metrics.AddAspNetCoreInstrumentation()
					.AddHttpClientInstrumentation()
					.AddRuntimeInstrumentation();
			})
			.WithTracing(tracing =>
			{
				tracing.AddSource(builder.Environment.ApplicationName)
					.AddAspNetCoreInstrumentation(tracing =>
						// Exclude health check requests from tracing
						tracing.Filter = context =>
							!context.Request.Path.StartsWithSegments(HealthEndpointPath)
							&& !context.Request.Path.StartsWithSegments(AlivenessEndpointPath)
					)
					// Uncomment the following line to enable gRPC instrumentation (requires the OpenTelemetry.Instrumentation.GrpcNetClient package)
					//.AddGrpcClientInstrumentation()
					.AddHttpClientInstrumentation();
			});

		builder.AddOpenTelemetryExporters();

		return builder;
	}

	private static TBuilder AddOpenTelemetryExporters<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
	{
		var useOtlpExporter = !string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);

		if (useOtlpExporter)
		{
			builder.Services.AddOpenTelemetry().UseOtlpExporter();
		}

		return builder;
	}

	public static TBuilder AddDefaultHealthChecks<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
	{
		builder.Services.AddHealthChecks()
			// Add a default liveness check to ensure app is responsive
			.AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);

		return builder;
	}

	public static WebApplication MapDefaultEndpoints(this WebApplication app)
	{
		// Adding health checks endpoints to applications in non-development environments has security implications.
		// See https://aka.ms/dotnet/aspire/healthchecks for details before enabling these endpoints in non-development environments.
		if (app.Environment.IsDevelopment())
		{
			// All health checks must pass for app to be considered ready to accept traffic after starting
			app.MapHealthChecks(HealthEndpointPath);

			// Only health checks tagged with the "live" tag must pass for app to be considered alive
			app.MapHealthChecks(AlivenessEndpointPath, new HealthCheckOptions
			{
				Predicate = r => r.Tags.Contains("live")
			});
		}

		return app;
	}

	public static void SetupDefaults(this IHostApplicationBuilder builder, string[] args)
	{
		builder.AddServiceDefaults();
		builder.Services.Configure<HostOptions>(options =>
		{
			//Service Behavior in case of exceptions - defaults to StopHost if it throws an exception
			options.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.Ignore;
			//Host will try to wait 10 seconds before stopping the service.
			options.ShutdownTimeout = TimeSpan.FromSeconds(10);
		});
	}
	public static void AddOptionsWithBaseValidationOnStart<T>(this IServiceCollection services, IConfiguration configuration,
	params Expression<Func<T, object>>[] propertyExpressions)
	where T : class, IDreamTeamEverOptions
	{
		services.AddOptions<T>()
			.Bind(configuration.GetSection(T.SectionName))
			.ValidateOnStart();

		services.AddSingleton<IValidateOptions<T>>(_ => new BaseOptionsValidator<T>(null, propertyExpressions));
	}
	private static Serilog.ILogger AddSerilogLogger(this IHostApplicationBuilder builder, LoggerConfiguration configuration = null)
	{
		Log.Logger = configuration == null
			? builder.GetBaseLoggerConfiguration().CreateLogger()
			: configuration.CreateLogger();

		builder.Logging.ClearProviders();
		builder.Logging.AddSerilog(Log.Logger);
		// Register Serilog as the logging provider
		builder.Services.AddSingleton(Log.Logger);

		return Log.Logger;
	}

	private static LoggerConfiguration GetBaseLoggerConfiguration(this IHostApplicationBuilder builder)
	{
		var logBuilder = new LoggerConfiguration()
			.ReadFrom.Configuration(builder.Configuration,
				new ConfigurationReaderOptions(default(DependencyContext)) { SectionName = "Serilog" })
			.Enrich.FromLogContext()
			.Filter.ByExcluding(c =>
				c.Properties.Any(p => p.Value.ToString().Contains("unhealthy", StringComparison.OrdinalIgnoreCase)))
			.Filter.ByExcluding(c =>
				c.Properties.Any(p => p.Value.ToString().Contains("healthy", StringComparison.OrdinalIgnoreCase)))
			.Filter.ByExcluding(c =>
				c.Properties.Any(p => p.Value.ToString().Contains("degraded", StringComparison.OrdinalIgnoreCase)))
			.Filter.ByExcluding(
				c => c.MessageTemplate.Text.Contains("health check", StringComparison.OrdinalIgnoreCase));

		return logBuilder;
	}
}