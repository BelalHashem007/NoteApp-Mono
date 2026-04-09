using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Helpers;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class FolderService(IUnitOfWork unitOfWork, AppDbContextDapper dapper) : IFolderService
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

            if (dto.ParentId != null)
            {
                var parentFolder = await unitOfWork.Folders.GetById(dto.ParentId.Value) ?? throw new ValidationException("Parent folder does not exist");
            }

            var folder = new Folder { FolderName = dto.FolderName, UserId = userId, ParentId = dto.ParentId};

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
            var result = await dapper.DeleteFolderRecursively(id,userId);
            if (!result)
                throw new Exception("Could not delete folder");
        }

        public async Task<List<FoldersAndNotesViewModel>> GetAllFolderItems(string userId)
        {
            var folders = await unitOfWork.Folders.GetAllItems(userId);
            var rootFolders = new List<FoldersAndNotesViewModel>();
            var FoldersToLookUp = folders.ToDictionary(f => f.Id);

            foreach (var folder in folders)
            {
                if (folder.ParentId == null)
                {
                    rootFolders.Add(folder);
                }
                else if (FoldersToLookUp.TryGetValue(folder.ParentId.Value, out var parentFolder))
                {
                    parentFolder.SubFolders.Add(folder);
                }
            }

            return rootFolders;
        }
    }
}
