using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace DreamTeamEver.Infrastructure.Data.Repositories;

internal static class EfRepositoryQueryableExtensions
{
    public static IQueryable<T> ApplyTracking<T>(this IQueryable<T> query, bool asNoTracking)
        where T : class =>
        asNoTracking ? query.AsNoTracking() : query;

    public static IQueryable<T> Includes<T>(this IQueryable<T> query, Expression<Func<T, object>>[] includes)
        where T : class
    {
        if (includes.Length == 0)
            return query;

        foreach (var include in includes)
            query = query.Include(include);

        return query;
    }

    public static IQueryable<T> WhereIf<T>(this IQueryable<T> query, Expression<Func<T, bool>> predicate)
        where T : class =>
        query.Where(predicate);
}
