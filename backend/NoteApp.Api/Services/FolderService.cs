using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces;
using NoteApp.Api.Repositories;

namespace NoteApp.Api.Services
{
    public class FolderService(IFolderRepository folderRepo) : IFolderService
    {
        public async Task<Folder> CreateFolder(CreateFolderDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FolderName))
                throw new ValidationException("FolderName is required");

            var folder = new Folder { Name = dto.FolderName };
            await folderRepo.CreateFolder(folder);
            return folder;
        }

        public async Task DeleteFolder(Guid id)
        {
            var folderToDelete = await folderRepo.GetFolder(id);
            if (folderToDelete == null)
                throw new NotFoundException("No folder to delete");
            await folderRepo.DeleteFolder(id);
        }

        public async Task<Folder> GetFolder(Guid id)
        {
            var folder = await folderRepo.GetFolder(id) ?? throw new NotFoundException("Folder doesn`t exist");
            return folder;
        }

        public async Task<List<Folder>> GetFolders()
        {
            return await folderRepo.GetFolders();
        }

        public async Task<Folder> UpdateFolder(Guid id, UpdateFolderDto dto)
        {
            var folder = await folderRepo.GetFolder(id) ?? throw new NotFoundException("Folder doesn`t exist");

            if (string.IsNullOrWhiteSpace(dto.FolderName))
                throw new ValidationException("FolderName is required");

            folder.Name = dto.FolderName;
            await folderRepo.UpdateFolder(folder);
            return folder;
        }
    }
}
