using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class NoteService(IUnitOfWork unitOfWork) : INoteService
    {
        public async Task<List<NoteDto>> GetNotes(string userId, Guid folderId)
        {
            var notes = await unitOfWork.Notes.FindAll(x=> x.UserId == userId && x.FolderId == folderId);
            return [.. notes.Select(n => new NoteDto
            {
                Id = n.Id,
                Body = n.Body,
                CreatedAt = n.CreatedAt,
                Title = n.Title,
                UpdatedAt = n.UpdatedAt
            })];
        }

        public async Task<NoteDto> GetNote(string userId, Guid folderId, Guid id)
        {
            var note = await unitOfWork.Notes.Find(x => x.UserId == userId && x.FolderId == folderId && x.Id == id) ?? throw new NotFoundException("Note doesn`t exist");
            return new NoteDto 
            {
                Id = note.Id,
                Body= note.Body,
                UpdatedAt= note.CreatedAt,
                Title= note.Title,
                CreatedAt = note.UpdatedAt
            };
        }

        public async Task<NoteDto> CreateNote(string userId, Guid folderId, CreateNoteDto dto)
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
            return new NoteDto 
            { 
                Id = newNote.Id,
                Body = newNote.Body,
                CreatedAt= newNote.CreatedAt,
                Title = newNote.Title,
                UpdatedAt = newNote.UpdatedAt
            };
        }

        public async Task<NoteDto> UpdateNote(string userId,Guid folderId, Guid id, UpdateNoteDto dto)
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

            return new NoteDto 
            {
                Id = note.Id,
                Body = note.Body,
                UpdatedAt= note.UpdatedAt,
                CreatedAt = note.CreatedAt,
                Title = note.Title
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
