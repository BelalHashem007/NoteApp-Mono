using Dapper;
using Microsoft.Data.SqlClient;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using System.Data;

namespace NoteApp.Api.Data
{
    public class AppDbContextDapper(IConfiguration config)
    {
        //public async Task GetAllItemsInsideASingleFolder(Guid folderId, string userId, List<FolderViewModel> folders, List<NoteViewModel> notes)
        //{
        //    using (var dbConnection = new SqlConnection(config.GetConnectionString("Default")))
        //    {
        //        var storedProcedureName = "spFolderItems_Get";
        //        var values = new { folderId, userId };
        //        dbConnection.Open();
        //        using (var results = await dbConnection.QueryMultipleAsync(storedProcedureName, values,commandType: CommandType.StoredProcedure))
        //        {
        //            folders.AddRange((await results.ReadAsync<FolderViewModel>()).ToList());
        //            notes.AddRange((await results.ReadAsync<NoteViewModel>()).ToList());
        //        }
        //    }
        //}

        public async Task<bool> DeleteFolderRecursively(Guid folderId, string userId)
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
    }
}
