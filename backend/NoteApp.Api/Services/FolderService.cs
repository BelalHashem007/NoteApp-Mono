using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class FolderService(IFolderRepository folderRepo) : IFolderService
    {
        public async Task<Folder> CreateFolder(string userId, CreateFolderDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FolderName))
                throw new ValidationException("FolderName is required");

            var folder = new Folder { Name = dto.FolderName, UserId = userId };
            await folderRepo.CreateFolder( folder);
            return folder;
        }

        public async Task DeleteFolder(string userid, Guid id)
        {
            var folderToDelete = await folderRepo.GetFolder(userid, id);
            if (folderToDelete == null)
                throw new NotFoundException("No folder to delete");
            await folderRepo.DeleteFolder(userid, id);
        }

        public async Task<Folder> GetFolder(string userId,Guid id)
        {
            var folder = await folderRepo.GetFolder(userId, id) ?? throw new NotFoundException("Folder doesn`t exist");
            return folder;
        }

        public async Task<List<Folder>> GetFolders(string userId)
        {
            return await folderRepo.GetFolders(userId);
        }

        public async Task<Folder> UpdateFolder(string userid, Guid id, UpdateFolderDto dto)
        {
            var folder = await folderRepo.GetFolder(userid, id) ?? throw new NotFoundException("Folder doesn`t exist");

            if (string.IsNullOrWhiteSpace(dto.FolderName))
                throw new ValidationException("FolderName is required");

            folder.Name = dto.FolderName;
            await folderRepo.UpdateFolder(folder);
            return folder;
        }
    }
}
