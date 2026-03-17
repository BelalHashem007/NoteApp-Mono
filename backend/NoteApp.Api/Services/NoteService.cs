using NoteApp.Api.DTOs;
using NoteApp.Api.Entities;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces;
using NoteApp.Api.Repositories;

namespace NoteApp.Api.Services
{
    public class NoteService(INoteRepository noteRepo, IFolderRepository folderRepo) : INoteService
    {
        public async Task<List<NoteDto>> GetNotes(Guid folderId)
        {
            var notes = await noteRepo.GetNotes(folderId);
            return [.. notes.Select(n => new NoteDto
            {
                Id = n.Id,
                Body = n.Body,
                CreatedAt = n.CreatedAt,
                Title = n.Title,
                UpdatedAt = n.UpdatedAt
            })];
        }

        public async Task<NoteDto> GetNote(Guid id)
        {
            var note = await noteRepo.GetNote(id) ?? throw new NotFoundException("Note doesn`t exist");
            return new NoteDto 
            {
                Id = note.Id,
                Body= note.Body,
                UpdatedAt= note.CreatedAt,
                Title= note.Title,
                CreatedAt = note.UpdatedAt
            };
        }

        public async Task<NoteDto> CreateNote(Guid folderId, CreateNoteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                throw new ValidationException("Note title is required");

            var folder = await folderRepo.GetFolder(folderId) ?? throw new NotFoundException("Folder doesn`t exist");

            var newNote = new Note();
            newNote.Title = dto.Title;
            newNote.Body = dto.Body;
            newNote.FolderId = folderId;
            await noteRepo.CreateNote(newNote);
            return new NoteDto 
            { 
                Id = newNote.Id,
                Body = newNote.Body,
                CreatedAt= newNote.CreatedAt,
                Title = newNote.Title,
                UpdatedAt = newNote.UpdatedAt
            };
        }

        public async Task<NoteDto> UpdateNote(Guid id, UpdateNoteDto dto)
        {
            var note = await noteRepo.GetNote(id) ?? throw new NotFoundException("Note doesn`t exist");

            if (dto.Body == null && dto.Title == null)
                throw new ValidationException("Body and Title are empty!");

            if (dto.Body != null)
                note.Body = dto.Body;

            if (dto.Title != null)
                note.Title = dto.Title;

            await noteRepo.UpdateNote(note);

            return new NoteDto 
            {
                Id = note.Id,
                Body = note.Body,
                UpdatedAt= note.UpdatedAt,
                CreatedAt = note.CreatedAt,
                Title = note.Title
            };
        }

        public async Task DeleteNote(Guid id)
        {
            var noteToDelete = await noteRepo.GetNote(id) ?? throw new NotFoundException("Note doesn`t exist");
            await noteRepo.DeleteNote(id);
        }

    }
}
