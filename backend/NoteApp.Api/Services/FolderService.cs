using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Helpers;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class FolderService(IUnitOfWork unitOfWork) : IFolderService
    {
        public async Task<IEnumerable<FolderViewModel>> GetFolders(string userId, CancellationToken ct)
        {
            var folders = await unitOfWork.Folders.FindAll(x => x.UserId == userId, ct);
            var folderViews = new List<FolderViewModel>();

            foreach (var folder in folders)
                folderViews.Add(ObjectMapperHelper.Map<Folder, FolderViewModel>(folder));

            return folderViews;
        }

        public async Task<FolderViewModel> GetFolder(string userId, Guid id, CancellationToken ct)
        {
            var folder = await unitOfWork.Folders.Find(x => x.UserId == userId && x.Id == id, ct) ?? throw new NotFoundException("Folder does not exist");
            return ObjectMapperHelper.Map<Folder, FolderViewModel>(folder);
        }

        public async Task<FolderViewModel> CreateFolder(string userId, CreateFolderViewModel dto, CancellationToken ct)
        {
            var validator = new CreateFolderViewModelValidator();
            var result = validator.Validate(dto);
            if (!result.IsValid)
                throw new ValidationException(result.ToString());

            var folder = new Folder { FolderName = dto.FolderName, UserId = userId };

            await unitOfWork.Folders.Add(folder);
            await unitOfWork.Complete(ct);

            return ObjectMapperHelper.Map<Folder, FolderViewModel>(folder);
        }

        public async Task<FolderViewModel> UpdateFolder(string userId, Guid id, UpdateFolderViewModel dto, CancellationToken ct)
        {
            var validator = new UpdateFolderViewModelValidator();
            var result = validator.Validate(dto);
            if (!result.IsValid)
                throw new ValidationException(result.ToString());

            var folder = await unitOfWork.Folders.Find(x => x.UserId == userId && x.Id == id,ct) ?? throw new NotFoundException("Folder does not exist");

            folder.FolderName = dto.FolderName;
            unitOfWork.Folders.Update(folder);

            await unitOfWork.Complete(ct);

            return ObjectMapperHelper.Map<Folder, FolderViewModel>(folder);
        }

        public async Task DeleteFolder(string userId, Guid id, CancellationToken ct)
        {
            var folderToDelete = await unitOfWork.Folders.Find(x => x.UserId == userId && x.Id == id, ct) ?? throw new NotFoundException("No folder to delete");
            unitOfWork.Folders.Delete(folderToDelete);
            await unitOfWork.Complete(ct);
        }

    }
}
