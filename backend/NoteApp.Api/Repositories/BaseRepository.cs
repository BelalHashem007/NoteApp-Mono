using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.Interfaces.IRepositories;
using System.Linq.Expressions;

namespace NoteApp.Api.Repositories
{
    public class BaseRepository<T>(AppDbContext _context) : IBaseRepository<T> where T :class
    {
        public async Task<List<T>> GetAll()
        {
            return await _context.Set<T>().ToListAsync();
        }

        public async Task<T?> GetById(int id)
        {
            return await _context.Set<T>().FindAsync(id);
        }
        public async Task<T?> GetById(Guid id)
        {
            return await _context.Set<T>().FindAsync(id);
        }
        public async Task<T> Add(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
            return entity;
        }
        public T Update(T entity)
        {
            _context.Set<T>().Update(entity);
            return entity;
        }
        public void Delete(T entity)
        {
            _context.Set<T>().Remove(entity);
        }

        public async Task<T?> Find(Expression<Func<T,bool>> criteria)
        {
             return await _context.Set<T>().SingleOrDefaultAsync(criteria);
        }

        public async Task<IEnumerable<T>> FindAll(Expression<Func<T, bool>> criteria)
        {
            return await _context.Set<T>().Where(criteria).ToListAsync();
        }
    }
}
