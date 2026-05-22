using DreamTeamEver.Api;
using DreamTeamEver.Api.Configuration;
using DreamTeamEver.Api.Hosting;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.DI;
using DreamTeamEver.Domain.Options;
using DreamTeamEver.Domain.Options.Validators;
using DreamTeamEver.Infrastructure;
using DreamTeamEver.Infrastructure.Data;
using DreamTeamEver.ServiceDefaults;
using FastEndpoints;
using FluentValidation;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Api.Extensions;

public static class WebApplicationBuilderExtensions
{
    /// <summary>
    /// Registers Dream Team Ever API services, data access, infrastructure, and validation. Does not run EF migrations (see MigrationService + Aspire <c>WaitFor</c>).
    /// </summary>
    public static WebApplicationBuilder AddDreamTeamEver(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        var configuration = builder.Configuration;

        services.AddOptionsWithBaseValidationOnStart<ConnectionStringsOptions>(configuration, x => x.DreamTeamEverDbConnectionString);
        services.AddOptions<EmailNotificationOptions>()
            .Bind(configuration.GetSection(EmailNotificationOptions.SectionName))
            .ValidateOnStart();
        services.AddSingleton<IValidateOptions<EmailNotificationOptions>, EmailNotificationOptionsValidator>();
        services.Configure<AuthOptions>(configuration.GetSection(AuthOptions.SectionName));

        _ = configuration.GetSection(ConnectionStringsOptions.SectionName).Get<ConnectionStringsOptions>()
            ?? throw new InvalidOperationException("Connection strings options are not configured.");

        builder.AddServiceDefaults();

        services.AddLocalization(options => options.ResourcesPath = "Resources");

        builder.AddDatabase<DreamTeamEverDbContext, ConnectionStringsOptions>(
            x => x.DreamTeamEverDbConnectionString,
            "DreamTeamEver.Infrastructure");

        services.ConfigureRepositories(configuration);

        services.ConfigureCache(configuration);

        services.AddInfrastructure(configuration);

        services.ConfigureApplication(configuration);

        services.AddValidatorsFromAssembly(typeof(AssemblyMarker).Assembly);

        services
            .AddDreamTeamEverCors(configuration, builder.Environment)
            .AddDreamTeamEverJwtBearer(configuration)
            .AddEndpointsApiExplorer()
            .AddFastEndpoints()
            .ConfigureSwagger(configuration)
            .AddHttpContextAccessor();

        services.AddScoped<IRequestContextAccessor, HttpRequestContextAccessor>();

        services.AddHostedService<AdminSeedHostedService>();
        services.AddHostedService<PendingPaymentReminderHostedService>();

        services.AddProblemDetails();
        services.AddExceptionHandler<GlobalExceptionHandler>();

        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.KnownIPNetworks.Clear();
            options.KnownProxies.Clear();
            options.ForwardLimit = null;
        });

        return builder;
    }
}
