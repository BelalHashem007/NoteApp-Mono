using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.Interfaces.IRepositories;
using System.Linq.Expressions;

namespace NoteApp.Api.Repositories
{
    public class BaseRepository<T>(AppDbContext _context) : IBaseRepository<T> where T :class
    {
        public async Task<List<T>> GetAll(CancellationToken ct = default)
        {
            return await _context.Set<T>().ToListAsync(ct);
        }

        public async Task<T?> GetById(int id, CancellationToken ct = default)
        {
            return await _context.Set<T>().FindAsync(id,ct);
        }
        public async Task<T?> GetById(Guid id, CancellationToken ct = default)
        {
            return await _context.Set<T>().FindAsync(id,ct);
        }
        public async Task<T?> GetById(string id, CancellationToken ct = default)
        {
            return await _context.Set<T>().FindAsync(id,ct);
        }
        public async Task<T> Add(T entity, CancellationToken ct = default)
        {
            await _context.Set<T>().AddAsync(entity,ct);
            return entity;
        }
        public T Update(T entity, CancellationToken ct = default)
        {
            _context.Set<T>().Update(entity);
            return entity;
        }

        public List<T> UpdateRange(List<T> entities, CancellationToken ct = default)
        {
            _context.Set<T>().UpdateRange(entities);
            return entities;
        }
        public void Delete(T entity, CancellationToken ct = default)
        {
            _context.Set<T>().Remove(entity);
        }

        public async Task<T?> Find(Expression<Func<T,bool>> criteria, CancellationToken ct = default)
        {
             return await _context.Set<T>().SingleOrDefaultAsync(criteria, ct);
        }

        public async Task<IEnumerable<T>> FindAll(Expression<Func<T, bool>> criteria, CancellationToken ct = default)
        {
            return await _context.Set<T>().Where(criteria).ToListAsync(ct);
        }

        public async Task<int> ExecuteDelete(Expression<Func<T, bool>> criteria, CancellationToken ct = default)
        {
            return await _context.Set<T>().Where(criteria).ExecuteDeleteAsync(ct);
        }

        public async Task<bool> Any(Expression<Func<T, bool>> criteria, CancellationToken ct = default)
        {
            return await _context.Set<T>().AnyAsync(criteria, ct);
        }
    }
}
