CREATE OR ALTER PROCEDURE [dbo].[spNotes_SearchNotes]
  /*EXEC spNotes_SearchNotes @SearchTerm = 'belal', @UserId='e00d75a7-226c-40fd-abb1-1461c575fb6c', @TagsJson='["work"]'*/
    @SearchTerm NVARCHAR(4000),
    @UserId NVARCHAR(450),
    @TagsJson NVARCHAR(MAX) = NULL
  AS
  BEGIN
      DECLARE @FullTextSearchTerm NVARCHAR(4000) = '"' + @SearchTerm + '*"';
      DECLARE @SelectedTags TABLE (TagName NVARCHAR(100));
      DECLARE @TagCount INT = 0;

      /*if tags are provided get their values inside @SelectedTags table and their count in @TagCount*/
      IF @TagsJson IS NOT NULL
      BEGIN
        INSERT INTO @SelectedTags SELECT [value] FROM OPENJSON(@TagsJson);
        SELECT @TagCount = COUNT(*) FROM @SelectedTags;
      END

      /*Search title first and then body and make the title weigh more (*100) and then filter based on userid and tags if provided*/
      SELECT TOP(7)
        Notes.Id,
        Notes.Title,
        Notes.SearchableBody,
        Notes.Slug,
        Folders.FolderName,
        ranksGroupedByNoteId.[RANK],
        (
            SELECT t.Id, t.Name
            FROM NotesToTags nt
            JOIN Tags t ON nt.TagsId = t.Id
            WHERE nt.NotesId = Notes.Id
            FOR JSON PATH
        ) AS TagsJson
      FROM (
        SELECT InnerSearch.[KEY],
               SUM(InnerSearch.[RANK]) AS [RANK]
        FROM (
            SELECT [KEY] AS [KEY],
                    [RANK] * 100 AS [RANK]
            FROM CONTAINSTABLE(Notes, Title, @FullTextSearchTerm) 

            UNION ALL

            SELECT [KEY] AS [KEY],
                    [RANK]
            FROM CONTAINSTABLE(Notes, SearchableBody, @FullTextSearchTerm) 

        ) InnerSearch

        GROUP BY InnerSearch.[KEY]
      ) ranksGroupedByNoteId
      INNER JOIN Notes ON Notes.Id = ranksGroupedByNoteId.[KEY]
      INNER JOIN Folders ON Folders.Id = Notes.FolderId
      WHERE Notes.UserId = @UserId
        AND (
          @TagsJson IS NULL 
          OR (
              SELECT COUNT(DISTINCT t.Name)
              FROM NotesToTags nt
              JOIN Tags t ON nt.TagsId = t.Id
              WHERE nt.NotesId = Notes.Id 
              AND t.Name IN (SELECT TagName FROM @SelectedTags)
          ) = @TagCount
        )
      ORDER BY ranksGroupedByNoteId.[RANK] DESC
  END
  