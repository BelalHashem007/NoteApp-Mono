using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class TagService(IUnitOfWork unitOfWork) : ITagService
    {
        public async Task CreateTagOrAddToNote(string userId, TagDto tagDto, CancellationToken ct)
        {
            var validator = new TagDtoValidator();
            var result = validator.Validate(tagDto);

            if (!result.IsValid)
                throw new ValidationException(result.ToString());

            var normaliziedTagName = tagDto.Name.Trim().ToLower();
            var tagToAddToNote = await unitOfWork.Tags.Find(t => t.Name == normaliziedTagName && t.UserId == userId, ct);
            var note = await unitOfWork.Notes.FindWithTags(x => x.UserId == userId && x.Id == tagDto.NoteId, ct) ?? throw new NotFoundException("Note does not exist");
            if (tagToAddToNote != null)
            {
                note.Tags.Add(tagToAddToNote);
                await unitOfWork.Complete();
                return;
            }

            var tag = new Tag
            {
                Name = normaliziedTagName,
                UserId = userId,
            };

            note.Tags.Add(tag);
            await unitOfWork.Complete();
        }

        public async Task RemoveTag(string userId, TagDto tagDto, CancellationToken ct)
        {
            var validator = new TagDtoValidator();
            var result = validator.Validate(tagDto);

            if (!result.IsValid)
                throw new ValidationException(result.ToString());

            var normaliziedTagName = tagDto.Name.Trim().ToLower();
            var tagToRemove= await unitOfWork.Tags.Find(t => t.Name == normaliziedTagName && t.UserId == userId, ct);
            var note = await unitOfWork.Notes.FindWithTags(x => x.UserId == userId && x.Id == tagDto.NoteId, ct) ?? throw new NotFoundException("Note does not exist");

            note.Tags.Remove(tagToRemove);
            var isUsed = await unitOfWork.NotesToTages.Any(x => x.TagsId == tagToRemove.Id && x.NotesId != note.Id, ct);
            if (!isUsed)
            {
                unitOfWork.Tags.Delete(tagToRemove, ct);
            }

            await unitOfWork.Complete();
        }
    }
}
