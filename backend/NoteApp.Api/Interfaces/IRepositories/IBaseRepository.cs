using System.Linq.Expressions;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IBaseRepository<T> where T : class
    {
        public Task<List<T>> GetAll();
        public Task<T?> GetById(int id);
        public Task<T?> GetById(Guid id);
        public Task<T> Add(T entity);
        public T Update(T entity);
        public void Delete(T entity);
        public Task<T?> Find(Expression<Func<T, bool>> criteria);
        public Task<IEnumerable<T>> FindAll(Expression<Func<T, bool>> criteria);
    }
}
