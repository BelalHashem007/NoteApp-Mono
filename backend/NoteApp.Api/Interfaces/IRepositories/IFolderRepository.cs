using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using System.Linq.Expressions;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IFolderRepository : IBaseRepository<Folder>
    {
        public Task<List<FoldersAndNotesViewModel>> GetAllItems(string userId);
    }
}
