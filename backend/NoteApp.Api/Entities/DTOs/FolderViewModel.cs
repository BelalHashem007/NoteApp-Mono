using FluentValidation;

namespace NoteApp.Api.Entities.DTOs
{
    public class FolderViewModel
    {
        public Guid Id { get; set; }
        public string FolderName { get; set; }
    }

    public class UpdateFolderViewModel
    {
        public string FolderName { get; set; }
    }
    
    public class UpdateFolderViewModelValidator : AbstractValidator<UpdateFolderViewModel>
    {
        public UpdateFolderViewModelValidator()
        {
            RuleFor(updateFolderModel => updateFolderModel.FolderName)
                .NotEmpty();
        }
    }

    public class CreateFolderViewModel
    {
        public string FolderName { get; set; } = string.Empty;
    }

    public class CreateFolderViewModelValidator : AbstractValidator<CreateFolderViewModel>
    {
        public CreateFolderViewModelValidator()
        {
            RuleFor(createFolderModel => createFolderModel.FolderName)
                .NotEmpty();
        }
    }
}
