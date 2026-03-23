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
        public async Task<ResponseViewModel<IEnumerable<NoteViewModel>>> GetNotes(string userId, Guid folderId)
        {
            var notes = await unitOfWork.Notes.FindAll(x=> x.UserId == userId && x.FolderId == folderId);
            IList<NoteViewModel> noteViews = [];
            foreach (var note in notes)
            {
                noteViews.Add(ObjectMapperHelper.Map<Note, NoteViewModel>(note));
            }

            return new ResponseViewModel<IEnumerable<NoteViewModel>>
            {
                Success = true,
                Message = "Retrieved Notes successfully",
                Data = noteViews
            };
        }

        public async Task<ResponseViewModel<NoteViewModel>> GetNote(string userId, Guid folderId, Guid id)
        {
            var note = await unitOfWork.Notes.Find(x => x.UserId == userId && x.FolderId == folderId && x.Id == id) ?? throw new NotFoundException("Note doesn`t exist");
            return new ResponseViewModel<NoteViewModel>
            {
                Success = true,
                Message = "Retrieved Note successfully",
                Data = ObjectMapperHelper.Map<Note, NoteViewModel>(note)
            };
        }

        public async Task<ResponseViewModel<NoteViewModel>> CreateNote(string userId, Guid folderId, CreateNoteViewModel dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                throw new ValidationException("Note title is required");

            var folder = await unitOfWork.Folders.Find(x => x.UserId == userId && x.Id == folderId) ?? throw new NotFoundException("Folder doesn`t exist");

            var newNote = new Note();

            newNote.Title = dto.Title;
            newNote.Body = dto.Body;
            newNote.FolderId = folderId;
            newNote.UserId = userId;

            await unitOfWork.Notes.Add(newNote);
            await unitOfWork.Complete();

            return new ResponseViewModel<NoteViewModel>
            {
                Success = true,
                Message = "Created Note successfully",
                Data = ObjectMapperHelper.Map<Note, NoteViewModel>(newNote)
            };
        }

        public async Task<ResponseViewModel<NoteViewModel>> UpdateNote(string userId,Guid folderId, Guid id, UpdateNoteViewModel dto)
        {
            var note = await unitOfWork.Notes.Find(x => x.UserId == userId && x.FolderId == folderId && x.Id == id) ?? throw new NotFoundException("Note doesn`t exist");

            if (dto.Body == null && dto.Title == null)
                throw new ValidationException("Body and Title are empty!");

            if (dto.Body != null)
                note.Body = dto.Body;

            if (dto.Title != null)
                note.Title = dto.Title;

            unitOfWork.Notes.Update(note);
            await unitOfWork.Complete();

            return new ResponseViewModel<NoteViewModel>
            {
                Success = true,
                Message = "Updated Note successfully",
                Data = ObjectMapperHelper.Map<Note, NoteViewModel>(note)
            };
        }

        public async Task DeleteNote(string userId, Guid folderId, Guid id)
        {
            var noteToDelete = await unitOfWork.Notes.Find(x => x.UserId == userId && x.FolderId == folderId && x.Id == id) ?? throw new NotFoundException("Note doesn`t exist");
            unitOfWork.Notes.Delete(noteToDelete);
            await unitOfWork.Complete();
        }

    }
}
