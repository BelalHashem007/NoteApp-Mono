using CloudinaryDotNet;
using CloudinaryActions = CloudinaryDotNet.Actions;
using FakeItEasy;
using Microsoft.AspNetCore.Http;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;
using NoteApp.Api.Services;
using System.Net;
using System.Linq.Expressions;

namespace NoteApi.UnitTests.Services
{
    public class NoteServiceTests
    {
        private static NoteService CreateSut(IUnitOfWork unitOfWork, ICloudinaryUploader? cloudinaryUploader = null) =>
            new(unitOfWork, cloudinaryUploader ?? A.Fake<ICloudinaryUploader>());

        private static Note NoteWithAttachments(params Attachment[] attachments) =>
            new()
            {
                Title = "title",
                Body = "body",
                Attachments = [.. attachments],
            };

        [Fact]
        public async Task GetNotes_WhenRepositoryReturnsNotes_ShouldMapTitlesAndCallGetAllNotesWithSearch()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var searchVm1 = new NoteForSearchViewModel
            {
                Id = Guid.NewGuid(),
                Title = "TestNote 1",
                SearchableBody = "",
                Slug = "a",
                FolderName = "F",
            };
            var searchVm2 = new NoteForSearchViewModel
            {
                Id = Guid.NewGuid(),
                Title = "TestNote 2",
                SearchableBody = "",
                Slug = "b",
                FolderName = "F",
            };
            A.CallTo(() => unitOfWork.Notes.GetAllNotesWithSearch("100", "q", "t1", A<CancellationToken>.Ignored))
                .Returns(Task.FromResult(new List<NoteForSearchViewModel> { searchVm1, searchVm2 }));
            var sut = CreateSut(unitOfWork);

            //act
            var result = await sut.GetNotes("100", "q", "t1", CancellationToken.None);

            //assert
            Assert.Equal(2, result.Count);
            Assert.Collection(result,
                item => Assert.Equal("TestNote 1", item.Title),
                item => Assert.Equal("TestNote 2", item.Title));
            A.CallTo(() => unitOfWork.Notes.GetAllNotesWithSearch("100", "q", "t1", A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetNotes_WhenBodyMatchesQuery_ShouldSetSnippetAndBodyHighlight()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var searchVm = new NoteForSearchViewModel
            {
                Id = Guid.NewGuid(),
                Title = "Other",
                SearchableBody = "prefix foo suffix",
                Slug = "s",
                FolderName = "F",
            };
            A.CallTo(() => unitOfWork.Notes.GetAllNotesWithSearch(A<string>.Ignored, "foo", null, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult(new List<NoteForSearchViewModel> { searchVm }));
            var sut = CreateSut(unitOfWork);

            //act
            var result = await sut.GetNotes("u", "foo", null, CancellationToken.None);

            //assert
            var item = Assert.Single(result);
            Assert.Contains("foo", item.Snippet, StringComparison.Ordinal);
            Assert.NotNull(item.HighLighted?.Body);
            Assert.Equal(7, item.HighLighted.Body.StartIndex);
            Assert.Equal(10, item.HighLighted.Body.EndIndex);
        }

        [Fact]
        public async Task GetNotes_WhenTitleMatchesQuery_ShouldSetTitleHighlight()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var searchVm = new NoteForSearchViewModel
            {
                Id = Guid.NewGuid(),
                Title = "Hello Foo Bar",
                SearchableBody = "",
                Slug = "s",
                FolderName = "F",
            };
            A.CallTo(() => unitOfWork.Notes.GetAllNotesWithSearch(A<string>.Ignored, "Foo", null, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult(new List<NoteForSearchViewModel> { searchVm }));
            var sut = CreateSut(unitOfWork);

            //act
            var result = await sut.GetNotes("u", "Foo", null, CancellationToken.None);

            //assert
            var item = Assert.Single(result);
            Assert.NotNull(item.HighLighted?.Title);
            Assert.Equal(6, item.HighLighted.Title.StartIndex);
            Assert.Equal(9, item.HighLighted.Title.EndIndex);
        }

        [Fact]
        public async Task GetNote_WhenNoteIsNotFound_ShouldThrowNotFoundException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(null));
            var sut = CreateSut(unitOfWork);

            //act
            var e = await Assert.ThrowsAsync<NotFoundException>(async () =>
                await sut.GetNote("1", Guid.NewGuid(), CancellationToken.None));

            //assert
            Assert.Equal("Note does not exist", e.Message);
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetNote_WhenNoteIsFound_ShouldReturnNote()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var note = new Note { Title = "TestNote" };
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(note));
            var sut = CreateSut(unitOfWork);

            //act
            var result = await sut.GetNote("1", Guid.NewGuid(), CancellationToken.None);

            //assert
            Assert.Equal(note.Title, result.Title);
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task CreateNote_WhenTitleIsNull_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel { Title = null! };
            var sut = CreateSut(unitOfWork);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateNote_WhenTitleIsEmpty_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel { Title = "" };
            var sut = CreateSut(unitOfWork);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateNote_WhenTitleIsWhiteSpaces_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel { Title = "    " };
            var sut = CreateSut(unitOfWork);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateNote_WhenTitleIsLongerThan50Characters_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel
            {
                Title = "abcdefghikabcdefghikabcdefghikabcdefghikabcdefghikabcdefghik",
            };
            var sut = CreateSut(unitOfWork);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateNote_WhenFolderDoesNotExist_ShouldThrowNotFoundException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel { Title = "test" };
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Folder?>(null));
            var sut = CreateSut(unitOfWork);

            //act
            await Assert.ThrowsAsync<NotFoundException>(async () =>
                await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateNote_WhenFolderDoesExistAndNoteTitleIsValidString_ShouldCreateNote()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel { Title = "test" };
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Folder?>(new Folder()));
            var sut = CreateSut(unitOfWork);

            //act
            var result = await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None);

            //assert
            Assert.Equal(dto.Title, result.Title);
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteTitleIsNullAndBodyIsNull_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Title = null, Body = null };
            var sut = CreateSut(unitOfWork);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.UpdateNote("1", Guid.NewGuid(), dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteTitleIsMoreThan50Characters_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel
            {
                Title = "abcdefghikabcdefghikabcdefghikabcdefghikabcdefghikabcdefghik",
            };
            var sut = CreateSut(unitOfWork);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.UpdateNote("1", Guid.NewGuid(), dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteToUpdateDoesNotExist_ShouldThrowNotFoundException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Title = "test" };
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(null));
            var sut = CreateSut(unitOfWork);

            //act
            await Assert.ThrowsAsync<NotFoundException>(async () =>
                await sut.UpdateNote("1", Guid.NewGuid(), dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteToUpdateDoesExistAndTitleExistAndBodyIsNull_ShouldUpdateTitleOnly()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Title = "test" };
            var existing = NoteWithAttachments();
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(existing));
            var sut = CreateSut(unitOfWork);

            //act
            var result = await sut.UpdateNote("1", Guid.NewGuid(), dto, CancellationToken.None);

            //assert
            Assert.Equal(dto.Title, result.Title);
            Assert.NotEqual(dto.Body, result.Body);
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteToUpdateDoesExistAndTitleIsNullAndBodyExist_ShouldUpdateBodyOnly()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Body = "test" };
            var existing = NoteWithAttachments();
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(existing));
            var sut = CreateSut(unitOfWork);

            //act
            var result = await sut.UpdateNote("1", Guid.NewGuid(), dto, CancellationToken.None);

            //assert
            Assert.Equal(dto.Body, result.Body);
            Assert.NotEqual(dto.Title, result.Title);
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteToUpdateDoesExistAndTitleExistAndBodyExist_ShouldUpdateTitleAndBody()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Body = "test", Title = "test title" };
            var existing = NoteWithAttachments();
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(existing));
            var sut = CreateSut(unitOfWork);

            //act
            var result = await sut.UpdateNote("1", Guid.NewGuid(), dto, CancellationToken.None);

            //assert
            Assert.Equal(dto.Body, result.Body);
            Assert.Equal(dto.Title, result.Title);
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdateNote_WhenImageIdsProvided_ShouldSoftDeleteAttachmentsNotInList()
        {
            //arrange
            var keepId = Guid.NewGuid();
            var removeId = Guid.NewGuid();
            var keep = new Attachment { Id = keepId, IsDeleted = false };
            var remove = new Attachment { Id = removeId, IsDeleted = false };
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Title = "t", ImageIds = [keepId.ToString()] };
            var existing = NoteWithAttachments(keep, remove);
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(existing));
            var sut = CreateSut(unitOfWork);

            //act
            await sut.UpdateNote("1", Guid.NewGuid(), dto, CancellationToken.None);

            //assert
            Assert.False(keep.IsDeleted);
            Assert.Null(keep.DeletedAt);
            Assert.True(remove.IsDeleted);
            Assert.NotNull(remove.DeletedAt);
        }

        [Fact]
        public async Task DeleteNote_WhenNoteToDeleteDoesNotExist_ShouldThrowNotFoundException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(null));
            var sut = CreateSut(unitOfWork);

            //act
            await Assert.ThrowsAsync<NotFoundException>(async () =>
                await sut.DeleteNote("1", Guid.NewGuid(), CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Delete(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task DeleteNote_WhenNoteToDeleteDoesExist_ShouldSoftDeleteAttachmentsAndDeleteNote()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var att = new Attachment { IsDeleted = false };
            var note = NoteWithAttachments(att);
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(note));
            var sut = CreateSut(unitOfWork);

            //act
            await sut.DeleteNote("1", Guid.NewGuid(), CancellationToken.None);

            //assert
            Assert.True(att.IsDeleted);
            Assert.NotNull(att.DeletedAt);
            A.CallTo(() => unitOfWork.Notes.FindWithAttachments(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Delete(A<Note>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetBySlugName_WhenSlugIsWhitespace_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var sut = CreateSut(unitOfWork);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.GetBySlugName("1", "   ", CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Notes.FindWithTags(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustNotHaveHappened();
        }

        [Fact]
        public async Task GetBySlugName_WhenNoteMissing_ShouldThrowNotFoundException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            A.CallTo(() => unitOfWork.Notes.FindWithTags(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(null));
            var sut = CreateSut(unitOfWork);

            //act
            var ex = await Assert.ThrowsAsync<NotFoundException>(async () =>
                await sut.GetBySlugName("1", "my-slug", CancellationToken.None));

            //assert
            Assert.Equal("Note does not exist", ex.Message);
        }

        [Fact]
        public async Task GetBySlugName_WhenNoteExists_ShouldReturnViewModelWithTags()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var note = new Note
            {
                Title = "N",
                Slug = "my-slug",
                Tags =
                [
                    new Tag { Id = 1, Name = "a" },
                    new Tag { Id = 2, Name = "b" },
                ],
            };
            A.CallTo(() => unitOfWork.Notes.FindWithTags(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(note));
            var sut = CreateSut(unitOfWork);

            //act
            var result = await sut.GetBySlugName("1", "my-slug", CancellationToken.None);

            //assert
            Assert.Equal("N", result.Title);
            Assert.Equal(2, result.Tags.Count);
            Assert.Equal("a", result.Tags[0].Name);
            Assert.Equal("b", result.Tags[1].Name);
        }

        [Fact]
        public async Task MoveNote_WhenNoteMissing_ShouldThrowNotFoundException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            A.CallTo(() => unitOfWork.Notes.FindWithTags(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(null));
            var sut = CreateSut(unitOfWork);

            //act
            await Assert.ThrowsAsync<NotFoundException>(async () =>
                await sut.MoveNote("1", Guid.NewGuid(), Guid.NewGuid(), CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task MoveNote_WhenFolderUnchanged_ShouldNotCallComplete()
        {
            //arrange
            var folderId = Guid.NewGuid();
            var unitOfWork = A.Fake<IUnitOfWork>();
            var note = new Note { FolderId = folderId, Title = "T" };
            A.CallTo(() => unitOfWork.Notes.FindWithTags(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(note));
            var sut = CreateSut(unitOfWork);

            //act
            await sut.MoveNote("1", Guid.NewGuid(), folderId, CancellationToken.None);

            //assert
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task MoveNote_WhenFolderChanges_ShouldUpdateAndComplete()
        {
            //arrange
            var oldFolder = Guid.NewGuid();
            var newFolder = Guid.NewGuid();
            var unitOfWork = A.Fake<IUnitOfWork>();
            var note = new Note { FolderId = oldFolder, Title = "T" };
            A.CallTo(() => unitOfWork.Notes.FindWithTags(A<Expression<Func<Note, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Note?>(note));
            var sut = CreateSut(unitOfWork);

            //act
            var result = await sut.MoveNote("1", Guid.NewGuid(), newFolder, CancellationToken.None);

            //assert
            Assert.Equal(newFolder, note.FolderId);
            Assert.Equal("T", result.Title);
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UploadImage_WhenUserIdEmpty_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var file = new FormFile(new MemoryStream([1]), 0, 1, "f", "x.jpg");
            var sut = CreateSut(unitOfWork);

            //act
            var ex = await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.UploadImage("", Guid.NewGuid(), file, CancellationToken.None));

            //assert
            Assert.Equal("Invalid user id", ex.Message);
        }

        [Fact]
        public async Task UploadImage_WhenFileNull_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var sut = CreateSut(unitOfWork);

            //act
            var ex = await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.UploadImage("u", Guid.NewGuid(), null!, CancellationToken.None));

            //assert
            Assert.Equal("File does not exist", ex.Message);
        }

        [Fact]
        public async Task UploadImage_WhenFileEmpty_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var file = new FormFile(Stream.Null, 0, 0, "f", "x.jpg");
            var sut = CreateSut(unitOfWork);

            //act
            var ex = await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.UploadImage("u", Guid.NewGuid(), file, CancellationToken.None));

            //assert
            Assert.Equal("File does not exist", ex.Message);
        }

        [Fact]
        public async Task UploadImage_WhenExtensionInvalid_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var file = new FormFile(new MemoryStream([1]), 0, 1, "f", "x.pdf");
            var sut = CreateSut(unitOfWork);

            //act
            var ex = await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.UploadImage("u", Guid.NewGuid(), file, CancellationToken.None));

            //assert
            Assert.Contains("Invalid file extensions", ex.Message, StringComparison.Ordinal);
        }

        [Fact]
        public async Task UploadImage_WhenFileTooLarge_ShouldThrowValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var file = A.Fake<IFormFile>();
            A.CallTo(() => file.FileName).Returns("big.jpg");
            A.CallTo(() => file.Length).Returns(10L * 1024 * 1024 + 1);
            A.CallTo(() => file.OpenReadStream()).Returns(new MemoryStream());
            var sut = CreateSut(unitOfWork);

            //act
            var ex = await Assert.ThrowsAsync<ValidationException>(async () =>
                await sut.UploadImage("u", Guid.NewGuid(), file, CancellationToken.None));

            //assert
            Assert.Contains("Invalid file size", ex.Message, StringComparison.Ordinal);
        }

        [Fact]
        public async Task UploadImage_WhenCloudinaryUploadFails_ShouldThrowCloudinaryException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var cloudinaryUploader = A.Fake<ICloudinaryUploader>();
            var file = new FormFile(new MemoryStream([1, 2, 3]), 0, 3, "f", "x.jpg")
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/jpeg",
            };

            A.CallTo(() => cloudinaryUploader.UploadAsync(A<CloudinaryActions.ImageUploadParams>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult(new CloudinaryActions.ImageUploadResult
                {
                    StatusCode = HttpStatusCode.BadRequest,
                    Error = new CloudinaryActions.Error { Message = "boom" },
                }));

            var sut = CreateSut(unitOfWork, cloudinaryUploader);

            //act
            var ex = await Assert.ThrowsAsync<CloudinaryException>(async () =>
                await sut.UploadImage("u", Guid.NewGuid(), file, CancellationToken.None));

            //assert
            Assert.Equal("boom", ex.Message);
            A.CallTo(() => unitOfWork.Attachments.Add(A<Attachment>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UploadImage_WhenCloudinaryUploadSucceeds_ShouldSaveAttachmentAndReturnAttachmentId()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var cloudinaryUploader = A.Fake<ICloudinaryUploader>();
            var file = new FormFile(new MemoryStream([1, 2, 3]), 0, 3, "f", "x.jpg")
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/jpeg",
            };

            var expectedAttachmentId = Guid.NewGuid();
            A.CallTo(() => unitOfWork.Attachments.Add(A<Attachment>.Ignored, A<CancellationToken>.Ignored))
                .Invokes((Attachment a, CancellationToken _) => a.Id = expectedAttachmentId)
                .ReturnsLazily((Attachment a, CancellationToken _) => Task.FromResult(a));

            A.CallTo(() => cloudinaryUploader.UploadAsync(A<CloudinaryActions.ImageUploadParams>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult(new CloudinaryActions.ImageUploadResult
                {
                    StatusCode = HttpStatusCode.OK,
                    SecureUrl = new Uri("https://example.com/x.jpg"),
                    PublicId = "public_id",
                }));

            var sut = CreateSut(unitOfWork, cloudinaryUploader);

            //act
            var result = await sut.UploadImage("u", Guid.NewGuid(), file, CancellationToken.None);

            //assert
            Assert.Equal(expectedAttachmentId.ToString(), result);
            A.CallTo(() => unitOfWork.Attachments.Add(A<Attachment>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
        }
    }
}
