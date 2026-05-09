using Dapper;
using Microsoft.Data.SqlClient;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using System.Data;
using System.Text.Json;

namespace NoteApp.Api.Data
{
    public class AppDbContextDapper(IConfiguration config)
    {
        public virtual async Task<bool> DeleteFolderRecursively(Guid folderId, string userId)
        {
            using (var dbConnection = new SqlConnection(config.GetConnectionString("Default")))
            {
                var storedProcedureName = "spFolders_DeleteRecursion";
                var values = new { folderId, userId };
                dbConnection.Open();
                var results = await dbConnection.ExecuteAsync(storedProcedureName, values, commandType: CommandType.StoredProcedure);
                if (results > 0)
                    return true;
                else return false;
            }
        }

        public async Task<List<NoteForSearchViewModel>> GetNotesWithSearch(string userId, string searchQuery, string? tags)
        {
            using (var dbConnection = new SqlConnection(config.GetConnectionString("Default")))
            {
                var storedProcedureName = "spNotes_SearchNotes";
                var values = new { SearchTerm = searchQuery, userId, TagsJson = tags};
                dbConnection.Open();
                List<NoteForSearchViewModel> results = (await dbConnection.QueryAsync<NoteForSearchViewModel>(storedProcedureName, values, commandType: CommandType.StoredProcedure)).ToList();
                return results;
            }
        }
    }
}
