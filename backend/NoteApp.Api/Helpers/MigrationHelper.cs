using NoteApp.Api.Interfaces.IRepositories;

namespace NoteApp.Api.Helpers
{
    public class MigrationHelper(IUnitOfWork unitOfWork)
    {
        public async Task MigrateOldNotesSearchableBody()
        {
            var parser = new TipTapParser();

            var oldNotes = await unitOfWork.Notes.FindAll(n => string.IsNullOrEmpty(n.SearchableBody));

            foreach (var note in oldNotes) 
            {
                note.SearchableBody = parser.ExtractPlainText(note.Body ?? "");
            }

            await unitOfWork.Complete();
        }
    }
}
