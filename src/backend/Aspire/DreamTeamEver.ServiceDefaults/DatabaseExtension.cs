using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Microsoft.Extensions.Hosting;

public static class DatabaseExtension
{
    public static IServiceCollection AddDatabase<TContext, TOptions>(
        this IHostApplicationBuilder builder,
        Func<TOptions, string> connectionStringSelector,
        string assemblyName = null,
        ServiceLifetime serviceLifetime = ServiceLifetime.Scoped)
        where TContext : DbContext
        where TOptions : class
    {
        builder.Services.AddDatabaseWithoutEnrich<TContext, TOptions>(connectionStringSelector, assemblyName, serviceLifetime);

        return builder.Services;
    }

    private static IServiceCollection AddDatabaseWithoutEnrich<TContext, TOptions>(
        this IServiceCollection services,
        Func<TOptions, string> connectionStringSelector,
        string assemblyName = null,
        ServiceLifetime serviceLifetime = ServiceLifetime.Scoped)
        where TContext : DbContext
        where TOptions : class
    {
        services.AddDbContext<TContext>((serviceProvider, optionsBuilder) =>
            {
                var options = serviceProvider.GetRequiredService<IOptions<TOptions>>().Value;
                var connectionString = connectionStringSelector(options);

                optionsBuilder.UseNpgsql(connectionString, o =>
                {
                    // EnableRetryOnFailure conflicts with explicit transactions in payment/matricule flows.
                    o.CommandTimeout(120);
                    if (!string.IsNullOrWhiteSpace(assemblyName))
                    {
                        o.MigrationsAssembly(assemblyName);
                    }
                });
            },
            serviceLifetime);

        return services;
    }
}
