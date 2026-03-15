using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.DTOs;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces;
using NoteApp.Api.Repositories;

namespace NoteApp.Api.Services
{
    public class NoteService(INoteRepository noteRepo) : INoteService
    {
        public async Task<Note> CreateNote(CreateNoteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                throw new ArgumentException("Note name is required");

            var newNote = new Note();
            newNote.Title = dto.Title;
            newNote.Body = dto.Body;
            await noteRepo.CreateNote(newNote);
            return newNote;
        }

        public async Task DeleteNote(Guid id)
        {
            var noteToDelete = await noteRepo.GetNote(id) ?? throw new ArgumentException("Note doesn`t exist");
            await noteRepo.DeleteNote(id);
        }

        public async Task<Note> GetNote(Guid id)
        {
            var note = await noteRepo.GetNote(id) ?? throw new ArgumentException("Note doesn`t exist");
            return note;
        }

        public async Task<List<Note>> GetNotes()
        {
            return await noteRepo.GetNotes();
        }

        public async Task<Note> UpdateNote(Guid id,UpdateNoteDto dto)
        {
            var note = await noteRepo.GetNote(id) ?? throw new ArgumentException("Note doesn`t exist");

            if (dto.Body != null)
                note.Body = dto.Body;

            if (dto.Title != null)
                note.Title = dto.Title;

            await noteRepo.UpdateNote(note);

            return note;
        }
    }
}
