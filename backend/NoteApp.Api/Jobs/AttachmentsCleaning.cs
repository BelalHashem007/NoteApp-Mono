using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;

namespace NoteApp.Api.Jobs
{
    public class AttachmentsCleaning(AppDbContext context, ILogger<AttachmentsCleaning> logger)
    {
        public async Task Execute()
        {
            var thresholdDate = DateTime.UtcNow.AddDays(-2); 
            var attachmentsToDelete = await context.Attachments.Where(a => a.IsDeleted && a.DeletedAt < thresholdDate).ToListAsync();
            foreach(var attachment in attachmentsToDelete)
            {
                if (File.Exists(attachment.StoragePath))
                {
                    File.Delete(attachment.StoragePath);
                    DeleteDirectoryIfEmpty(attachment.StoragePath);
                }
            }
            context.Attachments.RemoveRange(attachmentsToDelete);
            var result = await context.SaveChangesAsync();
            logger.LogInformation("Deleted {rowsAffected} from Attachments Table", result);
        }

        private void DeleteDirectoryIfEmpty(string filePath)
        {
            try
            {
                string? noteFolder = Path.GetDirectoryName(filePath);

                for (int i = 0; i < 2; i++)
                {
                    if (string.IsNullOrEmpty(noteFolder) || !Directory.Exists(noteFolder))
                        return;

                    if (!Directory.EnumerateFileSystemEntries(noteFolder).Any())
                    {
                        Directory.Delete(noteFolder);
                        noteFolder = Path.GetDirectoryName(noteFolder);
                    }
                    else
                    {
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error cleaning up directory for file {path}", filePath);
            }
        }
    }
}
