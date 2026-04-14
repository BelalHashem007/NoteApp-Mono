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
        public List<TagViewModel> Tags { get; set; }
    }

    public class NoteWithoutBodyViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
    }

    public class  NoteForSearchViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string SearchableBody { get; set; }
        public string Slug { get; set; }
        public string FolderName { get; set; }
        public int Rank { get; set; }
    }

    public class NoteForSearchFilteredViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Snippet { get; set; }
        public string Slug { get; set; }
        public string FolderName { get; set; }
        public HighLighted HighLighted { get; set; }
    }

    public class HighLighted
    {
        public TitleMatch Title { get; set; }
        public BodyMatch Body { get; set; }
    }

    public class TitleMatch
    {
        public int? StartIndex { get; set; }
        public int? EndIndex { get; set; }
    }

    public class BodyMatch
    {
        public int? StartIndex { get; set; }
        public int? EndIndex { get; set; }
    }

    public class UpdateNoteViewModel
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public List<string>? ImageIds { get; set; }
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
