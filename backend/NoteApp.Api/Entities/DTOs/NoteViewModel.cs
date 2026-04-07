using FluentValidation;

namespace NoteApp.Api.Entities.DTOs
{
    public class NoteViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Body { get; set; }
        public string Slug { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class NoteWithoutBodyViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
    }

    public class UpdateNoteViewModel
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
    }

    public class UpdateNoteViewModelValidator : AbstractValidator<UpdateNoteViewModel>
    {
        public UpdateNoteViewModelValidator()
        {
            RuleFor(updateNodeModel => updateNodeModel)
                .Must(x => x.Title != null || x.Body != null);

            RuleFor(updateNodeModel => updateNodeModel.Title)
                .MaximumLength(50);
        }
    }

    public class CreateNoteViewModel
    {
        public required string Title { get; set; }
        public string? Body { get; set; }
    }

    public class CreateNoteViewModelValidator : AbstractValidator<CreateNoteViewModel>
    {
        public CreateNoteViewModelValidator()
        {
            RuleFor(createNodeModel => createNodeModel.Title)
                .MaximumLength(50)
                .NotEmpty();
        }
    }
}
