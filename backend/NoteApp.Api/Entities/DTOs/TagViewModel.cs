using FluentValidation;

namespace NoteApp.Api.Entities.DTOs
{
    public class TagViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
    public class TagDto
    {
        public string Name { get; set; }
        public Guid NoteId { get;  set; }
    }

    public class TagDtoValidator : AbstractValidator<TagDto>
    {
        public TagDtoValidator()
        {
            RuleFor(tagDto => tagDto.Name)
                .MaximumLength(100)
                .NotEmpty();
            RuleFor(tagDto => tagDto.NoteId)
                .NotEmpty();
        }
    }
}
