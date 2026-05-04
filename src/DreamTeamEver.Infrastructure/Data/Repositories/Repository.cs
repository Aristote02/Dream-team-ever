using System.Linq.Expressions;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Domain.Contracts.Pagination;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace DreamTeamEver.Infrastructure.Data.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected DreamTeamEverDbContext Context { get; }
    protected readonly DbSet<T> DbSet;

    public Repository(DreamTeamEverDbContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    /// <summary>Legacy access for derived repositories; prefer <see cref="DbSet"/>.</summary>
    protected DreamTeamEverDbContext _context => Context;

    protected DbSet<T> _dbSet => DbSet;

    public async Task<T> AddAsync(T entity, CancellationToken cancellationToken)
    {
        var result = await DbSet.AddAsync(entity, cancellationToken);
        return result.Entity;
    }

    public async Task AddRangeAsync(T[] entities, CancellationToken cancellationToken)
    {
        await DbSet.AddRangeAsync(entities, cancellationToken);
        await Context.SaveChangesAsync(cancellationToken);
    }

    public Task<T> UpdateAsync(T entity, CancellationToken cancellationToken)
    {
        var result = DbSet.Update(entity);
        return Task.FromResult(result.Entity);
    }

    public Task UpdateRangeAsync(T[] entities, CancellationToken cancellationToken)
    {
        DbSet.UpdateRange(entities);
        return Task.CompletedTask;
    }

    public Task<T> DeleteAsync(T entity, CancellationToken cancellationToken)
    {
        var result = DbSet.Remove(entity);
        return Task.FromResult(result.Entity);
    }

    public Task DeleteRangeAsync(T[] entities, CancellationToken cancellationToken)
    {
        DbSet.RemoveRange(entities);
        return Task.CompletedTask;
    }

    public async Task<List<T>> FindAsync(
        string searchTerm,
        int page,
        int pageSize,
        CancellationToken cancellationToken,
        params Expression<Func<T, string>>[] properties)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return [];

        Expression<Func<T, bool>> predicate = x => false;

        foreach (var property in properties)
        {
            var param = property.Parameters[0];

            var notNull = Expression.NotEqual(property.Body, Expression.Constant(null, typeof(string)));
            var contains = Expression.Call(
                property.Body,
                nameof(string.Contains),
                Type.EmptyTypes,
                Expression.Constant(searchTerm, typeof(string)));
            var andExpr = Expression.AndAlso(notNull, contains);

            var lambda = Expression.Lambda<Func<T, bool>>(andExpr, param);

            predicate = OrElse(predicate, lambda);
        }

        return await DbSet
            .AsNoTracking()
            .Where(predicate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken) =>
        DbSet.AsNoTracking().CountAsync(predicate, cancellationToken);

    public Task<T?> GetAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken,
        bool asNoTracking = true,
        params Expression<Func<T, object>>[] includes) =>
        DbSet
            .ApplyTracking(asNoTracking)
            .Includes(includes)
            .FirstOrDefaultAsync(predicate, cancellationToken);

    public async Task<TResult?> GetAsync<TResult>(
        Expression<Func<T, bool>> predicate,
        Expression<Func<T, TResult>> selector,
        CancellationToken cancellationToken,
        params Expression<Func<T, object>>[] includes) =>
        await DbSet
            .AsNoTracking()
            .WhereIf(predicate)
            .Includes(includes)
            .Select(selector)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IList<T>> GetAllAsync(
        CancellationToken cancellationToken,
        bool asNoTracking = true,
        params Expression<Func<T, object>>[] includes) =>
        await DbSet
            .ApplyTracking(asNoTracking)
            .Includes(includes)
            .ToListAsync(cancellationToken);

    public async Task<IList<T>> GetAllAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken,
        bool asNoTracking = true,
        params Expression<Func<T, object>>[] includes) =>
        await DbSet
            .ApplyTracking(asNoTracking)
            .WhereIf(predicate)
            .Includes(includes)
            .ToListAsync(cancellationToken);

    public async Task<PagedResult<T>> GetPagedAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<T, bool>> predicate,
        Func<IQueryable<T>, IOrderedQueryable<T>> orderBy,
        CancellationToken cancellationToken,
        bool asNoTracking = true,
        params Expression<Func<T, object>>[] includes)
    {
        var query = DbSet
            .ApplyTracking(asNoTracking)
            .WhereIf(predicate)
            .Includes(includes);

        query = orderBy(query);

        var totalCount = await query.CountAsync(cancellationToken);

        if (totalCount > 0 && (pageNumber - 1) * pageSize >= totalCount)
            pageNumber = 1;

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<T>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<IList<TResult>> GetAllAsync<TResult>(
        Expression<Func<T, bool>> predicate,
        Expression<Func<T, TResult>> selector,
        CancellationToken cancellationToken,
        params Expression<Func<T, object>>[] includes) =>
        await DbSet
            .AsNoTracking()
            .WhereIf(predicate)
            .Includes(includes)
            .Select(selector)
            .ToListAsync(cancellationToken);

    private static Expression<Func<T, bool>> OrElse(
        Expression<Func<T, bool>> expr1,
        Expression<Func<T, bool>> expr2)
    {
        var parameter = Expression.Parameter(typeof(T));

        var body = Expression.OrElse(
            Expression.Invoke(expr1, parameter),
            Expression.Invoke(expr2, parameter));

        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        Context.SaveChangesAsync(cancellationToken);

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default) =>
        Context.Database.BeginTransactionAsync(cancellationToken);

    public DbSet<T> Query() => Context.Set<T>();
}
