using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Helpers;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class NoteService(IUnitOfWork unitOfWork) : INoteService
    {
        public async Task<IEnumerable<NoteViewModel>> GetNotes(string userId, Guid folderId, CancellationToken ct)
        {
            var notes = await unitOfWork.Notes.FindAll(x=> x.UserId == userId && x.FolderId == folderId, ct);
            IList<NoteViewModel> noteViews = [];
            foreach (var note in notes)
            {
                noteViews.Add(ObjectMapperHelper.Map<Note, NoteViewModel>(note));
            }

            return noteViews;
        }

        public async Task<NoteViewModel> GetNote(string userId, Guid folderId, Guid id, CancellationToken ct)
        {
            var note = await unitOfWork.Notes.Find(x => x.UserId == userId && x.FolderId == folderId && x.Id == id,ct) ?? throw new NotFoundException("Note doesn`t exist");
            return ObjectMapperHelper.Map<Note, NoteViewModel>(note);
        }

        public async Task<NoteViewModel> CreateNote(string userId, Guid folderId, CreateNoteViewModel dto, CancellationToken ct )
        {
            var validator = new CreateNoteViewModelValidator();
            var result = validator.Validate(dto);

            if (!result.IsValid)
                throw new ValidationException(result.ToString());

            var folder = await unitOfWork.Folders
                .Find(x => x.UserId == userId && x.Id == folderId, ct) 
                ?? throw new NotFoundException("Folder doesn`t exist");

            var newNote = new Note();

            newNote.Title = dto.Title;
            newNote.Body = dto.Body;
            newNote.FolderId = folderId;
            newNote.UserId = userId;

            await unitOfWork.Notes.Add(newNote);
            await unitOfWork.Complete(ct);

            return ObjectMapperHelper.Map<Note, NoteViewModel>(newNote);
        }

        public async Task<NoteViewModel> UpdateNote(string userId,Guid folderId, Guid id, UpdateNoteViewModel dto, CancellationToken ct )
        {
            var validator = new UpdateNoteViewModelValidator();
            var result = validator.Validate(dto);

            if (!result.IsValid)
                throw new ValidationException(result.ToString());

            var note = await unitOfWork.Notes.Find(x => x.UserId == userId && x.FolderId == folderId && x.Id == id, ct) ?? throw new NotFoundException("Note doesn`t exist");

            if (dto.Body != null)
                note.Body = dto.Body;

            if (dto.Title != null)
                note.Title = dto.Title;

            unitOfWork.Notes.Update(note);
            await unitOfWork.Complete(ct);

            return ObjectMapperHelper.Map<Note, NoteViewModel>(note);
        }

        public async Task DeleteNote(string userId, Guid folderId, Guid id, CancellationToken ct)
        {
            var noteToDelete = await unitOfWork.Notes.Find(x => x.UserId == userId && x.FolderId == folderId && x.Id == id, ct) ?? throw new NotFoundException("Note doesn`t exist");
            unitOfWork.Notes.Delete(noteToDelete);
            await unitOfWork.Complete(ct);
        }

    }
}
