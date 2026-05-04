using System.Linq.Expressions;
using DreamTeamEver.Domain.Contracts.Pagination;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace DreamTeamEver.Application.Abstractions.Repositories;

public interface IRepository<T>
    where T : class
{
    Task<T> AddAsync(T entity, CancellationToken cancellationToken);
    Task AddRangeAsync(T[] entities, CancellationToken cancellationToken);

    Task<T> UpdateAsync(T entity, CancellationToken cancellationToken);
    Task UpdateRangeAsync(T[] entities, CancellationToken cancellationToken);

    Task<T> DeleteAsync(T entity, CancellationToken cancellationToken);
    Task DeleteRangeAsync(T[] entities, CancellationToken cancellationToken);

    Task<List<T>> FindAsync(
        string searchTerm,
        int page,
        int pageSize,
        CancellationToken cancellationToken,
        params Expression<Func<T, string>>[] properties);

    Task<int> CountAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken);

    Task<T?> GetAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken, bool asNoTracking = true, params Expression<Func<T, object>>[] includes);

    Task<TResult?> GetAsync<TResult>(Expression<Func<T, bool>> predicate, Expression<Func<T, TResult>> selector, CancellationToken cancellationToken, params Expression<Func<T, object>>[] includes);

    Task<IList<T>> GetAllAsync(CancellationToken cancellationToken, bool asNoTracking = true, params Expression<Func<T, object>>[] includes);

    Task<IList<T>> GetAllAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken, bool asNoTracking = true, params Expression<Func<T, object>>[] includes);

    Task<IList<TResult>> GetAllAsync<TResult>(Expression<Func<T, bool>> predicate, Expression<Func<T, TResult>> selector, CancellationToken cancellationToken, params Expression<Func<T, object>>[] includes);

    Task<PagedResult<T>> GetPagedAsync(int pageNumber, int pageSize,
        Expression<Func<T, bool>> predicate,
        Func<IQueryable<T>, IOrderedQueryable<T>> orderBy,
        CancellationToken cancellationToken,
        bool asNoTracking = true,
        params Expression<Func<T, object>>[] includes);

    /// <summary>Persists changes for the scoped database session (shared across repositories registered for the same request).</summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);

    DbSet<T> Query();
}