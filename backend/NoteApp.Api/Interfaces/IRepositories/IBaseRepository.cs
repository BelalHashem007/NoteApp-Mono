using System.Linq.Expressions;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IBaseRepository<T> where T : class
    {
        public Task<List<T>> GetAll(CancellationToken ct = default);
        public Task<T?> GetById(int id, CancellationToken ct = default);
        public Task<T?> GetById(Guid id, CancellationToken ct = default);
        public Task<T> Add(T entity, CancellationToken ct = default);
        public T Update(T entity, CancellationToken ct = default);
        public List<T> UpdateRange(List<T> entities, CancellationToken ct = default);
        public void Delete(T entity, CancellationToken ct = default );
        public Task<T?> Find(Expression<Func<T, bool>> criteria, CancellationToken ct = default);
        public Task<IEnumerable<T>> FindAll(Expression<Func<T, bool>> criteria, CancellationToken ct = default);
        public Task<int> ExecuteDelete(Expression<Func<T, bool>> criteria, CancellationToken ct = default);
    }
}
