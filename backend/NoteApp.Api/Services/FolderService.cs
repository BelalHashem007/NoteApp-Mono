using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class FolderService(IUnitOfWork unitOfWork) : IFolderService
    {
        public async Task<Folder> CreateFolder(string userId, CreateFolderDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FolderName))
                throw new ValidationException("FolderName is required");

            var folder = new Folder { Name = dto.FolderName, UserId = userId };
            await unitOfWork.Folders.Add(folder);
            await unitOfWork.Complete();
            return folder;
        }

        public async Task DeleteFolder(string userId, Guid id)
        {
            var folderToDelete = await unitOfWork.Folders.Find(x => x.UserId == userId && x.Id == id) ?? throw new NotFoundException("No folder to delete");
            unitOfWork.Folders.Delete(folderToDelete);
            await unitOfWork.Complete();
        }

        public async Task<Folder> GetFolder(string userId,Guid id)
        {
            var folder = await unitOfWork.Folders.Find(x => x.UserId == userId && x.Id == id) ?? throw new NotFoundException("Folder doesn`t exist");
            return folder;
        }

        public async Task<IEnumerable<Folder>> GetFolders(string userId)
        {
           return await unitOfWork.Folders.FindAll(x => x.UserId == userId);
        }

        public async Task<Folder> UpdateFolder(string userId, Guid id, UpdateFolderDto dto)
        {
            var folder = await unitOfWork.Folders.Find(x => x.UserId == userId && x.Id == id) ?? throw new NotFoundException("Folder doesn`t exist");

            if (string.IsNullOrWhiteSpace(dto.FolderName))
                throw new ValidationException("FolderName is required");

            folder.Name = dto.FolderName;
            unitOfWork.Folders.Update(folder);
            await unitOfWork.Complete();
            return folder;
        }
    }
}
