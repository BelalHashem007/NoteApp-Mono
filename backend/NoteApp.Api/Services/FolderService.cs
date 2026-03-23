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
        public async Task<ResponseViewModel<IEnumerable<FolderViewModel>>> GetFolders(string userId)
        {
            var folders = await unitOfWork.Folders.FindAll(x => x.UserId == userId);
            IList<FolderViewModel> folderViews = [];

            foreach (var folder in folders)
                folderViews.Add(ObjectMapperHelper.Map<Folder, FolderViewModel>(folder));

            return new ResponseViewModel<IEnumerable<FolderViewModel>>
            {
                Success = true,
                Message = "Retrieved Folders successfully",
                Data = folderViews
            };
        }

        public async Task<ResponseViewModel<FolderViewModel>> GetFolder(string userId, Guid id)
        {
            var folder = await unitOfWork.Folders.Find(x => x.UserId == userId && x.Id == id) ?? throw new NotFoundException("Folder doesn`t exist");
            return new ResponseViewModel<FolderViewModel>
            {
                Success = true,
                Message = "Retrieved Folder successfully",
                Data = ObjectMapperHelper.Map<Folder, FolderViewModel>(folder)
            };
        }

        public async Task<ResponseViewModel<FolderViewModel>> CreateFolder(string userId, CreateFolderViewModel dto)
        {
            var validator = new CreateFolderViewModelValidator();
            var result = validator.Validate(dto);
            if (!result.IsValid)
                throw new ValidationException(result.ToString());

            var folder = new Folder { FolderName = dto.FolderName, UserId = userId };

            await unitOfWork.Folders.Add(folder);
            await unitOfWork.Complete();

            return new ResponseViewModel<FolderViewModel>
            {
                Success = true,
                Message = "Created Folder successfully",
                Data = ObjectMapperHelper.Map<Folder, FolderViewModel>(folder)
            };
        }

        public async Task<ResponseViewModel<FolderViewModel>> UpdateFolder(string userId, Guid id, UpdateFolderViewModel dto)
        {
            var validator = new UpdateFolderViewModelValidator();
            var result = validator.Validate(dto);
            if (!result.IsValid)
                throw new ValidationException(result.ToString());

            var folder = await unitOfWork.Folders.Find(x => x.UserId == userId && x.Id == id) ?? throw new NotFoundException("Folder doesn`t exist");

            folder.FolderName = dto.FolderName;
            unitOfWork.Folders.Update(folder);

            await unitOfWork.Complete();

            return new ResponseViewModel<FolderViewModel>
            {
                Success = true,
                Message = "Upated Folder successfully",
                Data = ObjectMapperHelper.Map<Folder, FolderViewModel>(folder)
            };
        }

        public async Task DeleteFolder(string userId, Guid id)
        {
            var folderToDelete = await unitOfWork.Folders.Find(x => x.UserId == userId && x.Id == id) ?? throw new NotFoundException("No folder to delete");
            unitOfWork.Folders.Delete(folderToDelete);
            await unitOfWork.Complete();
        }

    }
}
