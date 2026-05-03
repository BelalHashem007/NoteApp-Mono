using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;

namespace NoteApp.Api.Jobs
{
    public class AttachmentsCleaning(AppDbContext context, ILogger<AttachmentsCleaning> logger, Cloudinary cloudinary)
    {
        public async Task Execute()
        {
            var thresholdDate = DateTime.UtcNow.AddDays(-2); 
            var attachmentsToDelete = await context.Attachments.Where(a => a.IsDeleted && a.DeletedAt < thresholdDate).ToListAsync();

            if (attachmentsToDelete.Count == 0)
            {
                logger.LogInformation("No attachments to delete at this time.");
                return;
            }

            var publicIds = attachmentsToDelete.Select(a => a.PublicId).ToList();
            await DeleteResourcesFromCloudinary(publicIds);
            context.Attachments.RemoveRange(attachmentsToDelete);
            var result = await context.SaveChangesAsync();
            logger.LogInformation("Deleted {rowsAffected} from Attachments Table", result);
        }

        private async Task DeleteResourcesFromCloudinary(List<string> publicIds)
        {
            var delResourceParams = new DelResParams()
            {
                PublicIds = publicIds,
                Type = "upload",
                ResourceType = ResourceType.Image
            };
            await cloudinary.DeleteResourcesAsync(delResourceParams);
        }
    }
}
