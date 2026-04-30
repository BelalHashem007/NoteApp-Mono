CREATE OR ALTER PROCEDURE [dbo].[spFolders_DeleteRecursion]
/*EXEC spFolders_DeleteRecursion @FolderId=''*/
	@FolderId UNIQUEIDENTIFIER,
	@UserId NVARCHAR(450)
AS
BEGIN

	BEGIN TRY
		BEGIN TRANSACTION;
			
			/*Make the folder tree then make a temp table of it to use it multiple times*/
			WITH FolderTree AS (
				SELECT Folders.Id
				FROM Folders
				WHERE Folders.Id = @FolderId AND Folders.UserId = @UserId

				UNION ALL

				SELECT Folders.Id
				FROM Folders
				JOIN FolderTree ON FolderTree.Id = Folders.ParentId
			)

			SELECT Id INTO #FolderIds 
			FROM FolderTree;

			/*Soft delete attachments, delete tags and notes relationship and lastly remove orphaned tags (tags with no relationship to note)*/
			UPDATE Attachments
            SET IsDeleted = 1, DeletedAt = GETUTCDATE(), NoteId = NULL
            FROM Attachments a
            INNER JOIN Notes n ON a.NoteId = n.Id
            WHERE n.FolderId IN (SELECT Id FROM #FolderIds )
				AND a.isDeleted = 0;

			DELETE nt 
			FROM NotesToTags AS nt 
			INNER JOIN Notes AS n ON n.Id = nt.NotesId
			WHERE n.FolderId IN (SELECT Id FROM #FolderIds)

			DELETE t
			FROM Tags AS t
			LEFT JOIN NotesToTags AS nt ON t.Id = nt.TagsId
			WHERE nt.TagsId IS NULL

			DELETE FROM Folders WHERE Folders.Id IN ( SELECT Id FROM #FolderIds )

			DROP TABLE #FolderIds
		COMMIT TRANSACTION
	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION
		;THROW;
	END CATCH

END