using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;

namespace NoteApp.Api.Jobs
{
    public class RefreshTokenCleaning(AppDbContext context, ILogger<RefreshTokenCleaning> logger)
    {
        public async Task Execute()
        {
            var rowsAffected = await context.Database.ExecuteSqlAsync($"DELETE FROM [dbo].[RefreshToken] WHERE [RevokedOn] IS NOT NULL OR [ExpiresOn] < GETUTCDATE()");
            logger.LogInformation("Deleted {rowsAffected} from RefreshToken Table", rowsAffected);
        }
    }
}
