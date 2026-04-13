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
        public async Task<List<NoteForSearchFilteredViewModel>> GetNotes(string userId, string searchQuery, CancellationToken ct)
        {
            var notes = await unitOfWork.Notes.GetAllNotesWithSearch(userId, searchQuery);
            List<NoteForSearchFilteredViewModel> results = [];

            foreach (var note in notes)
            {
                var filteredNote = ObjectMapperHelper.Map<NoteForSearchViewModel, NoteForSearchFilteredViewModel>(note);
                filteredNote.HighLighted = new HighLighted();
                if (!string.IsNullOrEmpty(note.SearchableBody) && note.SearchableBody.Contains(searchQuery, StringComparison.OrdinalIgnoreCase))
                {
                    var startIndex = note.SearchableBody.IndexOf(searchQuery, StringComparison.OrdinalIgnoreCase);
                    var startOfSnippet = startIndex - 30 >= 0 ? startIndex - 30 : 0;
                    var length = Math.Min(100, note.SearchableBody.Length - startOfSnippet);
                    var relativeStart = startIndex - startOfSnippet;
                    var relativeEnd = relativeStart + searchQuery.Length;

                    filteredNote.Snippet = note.SearchableBody.Substring(startOfSnippet, length);
                    filteredNote.HighLighted.Body = new BodyMatch
                    {
                        StartIndex = relativeStart,
                        EndIndex = relativeEnd
                    };
                }
                if (note.Title.Contains(searchQuery, StringComparison.OrdinalIgnoreCase))
                {
                    var startIndex = note.Title.IndexOf(searchQuery, StringComparison.OrdinalIgnoreCase);
                    var endIndex = startIndex + searchQuery.Length;
                    filteredNote.HighLighted.Title = new TitleMatch
                    {
                        StartIndex = startIndex,
                        EndIndex = endIndex
                    };
                }

                results.Add(filteredNote);
            }

            return results;
        }

        public async Task<NoteViewModel> GetNote(string userId, Guid id, CancellationToken ct)
        {
            var note = await unitOfWork.Notes.Find(
                x => x.UserId == userId && x.Id == id,ct) ?? throw new NotFoundException("Note does not exist");
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
                ?? throw new NotFoundException("Folder does not exist");

            var newNote = new Note();

            newNote.Title = dto.Title;
            newNote.Body = dto.Body;
            newNote.FolderId = folderId;
            newNote.UserId = userId;

            //creating slug
            string str = dto.Title.ToLowerInvariant();
            str = System.Text.RegularExpressions.Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = System.Text.RegularExpressions.Regex.Replace(str, @"\s+", " ").Trim();
            str = str.Replace(" ", "-");
            var suffix = Guid.NewGuid().ToString().Substring(0, 5).Replace(" ","");
            newNote.Slug = str +"-"+ suffix;

            await unitOfWork.Notes.Add(newNote);
            await unitOfWork.Complete(ct);

            return ObjectMapperHelper.Map<Note, NoteViewModel>(newNote);
        }

        public async Task<NoteViewModel> UpdateNote(string userId, Guid id, UpdateNoteViewModel dto, CancellationToken ct )
        {
            var validator = new UpdateNoteViewModelValidator();
            var result = validator.Validate(dto);

            if (!result.IsValid)
                throw new ValidationException(result.ToString());

            var note = await unitOfWork.Notes.FindWithAttachments(x => x.UserId == userId && x.Id == id, ct) ?? throw new NotFoundException("Note does not exist");

            if (dto.ImageIds != null)
            {
                var activeGuids = dto.ImageIds.Select(Guid.Parse).ToHashSet();
                foreach (var attachment in note.Attachments)
                {
                    if (activeGuids.Contains(attachment.Id))
                    {
                        attachment.IsDeleted = false;
                        attachment.DeletedAt = null;
                    }
                    else
                    {
                        attachment.IsDeleted = true;
                        attachment.DeletedAt = DateTime.UtcNow;
                    }
                }
            }
           
            if (dto.Body != null)
                note.Body = dto.Body;

            if (dto.Title != null)
                note.Title = dto.Title;

            note.UpdatedAt = DateTime.UtcNow;
            unitOfWork.Notes.Update(note);
            await unitOfWork.Complete(ct);

            return ObjectMapperHelper.Map<Note, NoteViewModel>(note);
        }

        public async Task DeleteNote(string userId, Guid id, CancellationToken ct)
        {
            var noteToDelete = await unitOfWork.Notes.FindWithAttachments(x => x.UserId == userId && x.Id == id, ct) ?? throw new NotFoundException("Note does not exist");
            var attachments = noteToDelete.Attachments.Where(a => !a.IsDeleted).ToList();

            foreach (var attachment in attachments)
            {
                attachment.IsDeleted = true;
                attachment.DeletedAt = DateTime.UtcNow;
            }
            unitOfWork.Notes.Delete(noteToDelete);
            await unitOfWork.Complete(ct);
        }

        public async Task<string> UploadImage(string userId, Guid noteId,IFormFile file, CancellationToken ct)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ValidationException("Invalid user id");
            //check existance
            if (file == null || file.Length == 0)
            {
                throw new ValidationException("File does not exist");
            }

            //check extension
            var extensions = new List<string>() { ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"};
            var fileExtension = Path.GetExtension(file.FileName);
            if (!extensions.Contains(fileExtension))
                throw new ValidationException("Invalid file extensions. Acceptable ones are: " + string.Join(",", extensions));

            //max size
            var size = file.Length;
            if (size > 10 * 1024 * 1024)
                throw new ValidationException("Invalid file size. Max allowed file size is 10MB");

            //save to file
            var fileName = Guid.NewGuid().ToString() + fileExtension;
            var path = Path.Combine(Directory.GetCurrentDirectory(), $"Uploads/{userId}/{noteId.ToString()}");

            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);

            using (var stream = new FileStream(Path.Combine(path, fileName), FileMode.Create))
            {
                await file.CopyToAsync(stream, ct);
            }

            //save to db
            var attachment = new Attachment()
            {
                UserId = userId,
                NoteId = noteId,
                OriginalName = file.FileName,
                CreatedAt = DateTime.Now,
                FileSize = size,
                StoragePath = Path.Combine(path, fileName),
                MimeType = file.ContentType,
            };

            await unitOfWork.Attachments.Add(attachment);
            await unitOfWork.Complete();

            var attachmentId = attachment.Id;
            return attachmentId.ToString();
        }

        public async Task<NoteViewModel> GetBySlugName(string userId,string slug, CancellationToken ct) 
        {
            if (string.IsNullOrWhiteSpace(slug))
                throw new ValidationException("Slug is required");

            var note = await unitOfWork.Notes.Find(n => n.Slug == slug && n.UserId == userId, ct) ?? throw new NotFoundException("Note does not exist");
                
            return ObjectMapperHelper.Map<Note,NoteViewModel>(note);
        }
    }
}
