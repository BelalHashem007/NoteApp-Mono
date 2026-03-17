using FakeItEasy;
using NoteApp.Api.Entities;
using NoteApp.Api.DTOs;
using NoteApp.Api.Repositories;
using NoteApp.Api.Services;
using NoteApp.Api.Exceptions;
namespace NoteApi.UnitTests.Services
{
    public class NoteServiceTests
    {
        [Fact]
        public async Task GetNote_WhenNoteDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            A.CallTo(() => noteRepository.GetNote(A<Guid>.Ignored)).Returns(Task.FromResult<Note?>(null));
            var sut = new NoteService(noteRepository, folderRepository);

            // Act / Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(async Task ()=> await sut.GetNote(Guid.NewGuid()));
            Assert.Equal("Note doesn`t exist", exception.Message);
            A.CallTo(() => noteRepository.GetNote(A<Guid>.Ignored)).MustHaveHappened();
        }

        [Fact]
        public async Task GetNote_WhenNoteExists_ShouldReturnTheNote()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            var note = new Note { Title="test title", Body= "test body"};
            A.CallTo(() => noteRepository.GetNote(A<Guid>.Ignored)).Returns(note);
            var sut = new NoteService(noteRepository, folderRepository);

            // Act
            var returnedNote = await sut.GetNote(Guid.NewGuid());

            // Assert
            Assert.NotNull(returnedNote);
            Assert.Equal(note.Title, returnedNote.Title);
            Assert.Equal(note.Body, returnedNote.Body);
            A.CallTo(() => noteRepository.GetNote(A<Guid>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetNotes_WhenCalled_ShouldAlwaysReturnAllNotes()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            var note1 = new Note { Title = "1", Body = "body 1"};
            var note2 = new Note { Title = "2", Body = "body 2"};
            A.CallTo(() => noteRepository.GetNotes(A<Guid>.Ignored)).Returns(new List<Note> { note1,note2});
            var sut = new NoteService(noteRepository, folderRepository);

            // Act 
            var result = await sut.GetNotes(Guid.NewGuid());

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Collection(result,
                item =>
                {
                    Assert.Equal("1", item.Title);
                    Assert.Equal("body 1", item.Body);
                },
                item =>
                {
                    Assert.Equal("2", item.Title);
                    Assert.Equal("body 2", item.Body);
                }
            );
        }

        [Fact]
        public async Task DeleteNote_WhenNoteDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            A.CallTo(() => noteRepository.GetNote(A<Guid>.Ignored)).Returns(Task.FromResult<Note?>(null));
            var sut = new NoteService(noteRepository, folderRepository);

            // Act / Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(async Task () => await sut.DeleteNote(Guid.NewGuid()));
            Assert.Equal("Note doesn`t exist", exception.Message);
            A.CallTo(() => noteRepository.DeleteNote(A<Guid>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task DeleteNote_WhenNoteExists_ShouldDeleteTheNote()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            var note = new Note {Id = Guid.NewGuid(), Title = "test title", Body = "test body" };
            A.CallTo(() => noteRepository.GetNote(A<Guid>.Ignored)).Returns(note);
            var sut = new NoteService(noteRepository, folderRepository);
            // Act
             await sut.DeleteNote(note.Id);

            // Assert
            A.CallTo(() => noteRepository.DeleteNote(note.Id)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task CreateNote_WhenDtoIsValid_ShouldCreateNoteAndCallRepo()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            A.CallTo(() => noteRepository.CreateNote(A<Note>.Ignored)).Returns(Task.FromResult(new Note()));
            var sut = new NoteService(noteRepository, folderRepository);

            var dto = new CreateNoteDto { Title = "title", Body = "body" };

            // Act
            var result = await sut.CreateNote(Guid.NewGuid(),dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("title", result.Title);
            Assert.Equal("body", result.Body);
            A.CallTo(() => noteRepository.CreateNote(A<Note>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task CreateNote_MissingTitle_ShouldThrowArgumentException()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            var sut = new NoteService(noteRepository, folderRepository);

            var dto = new CreateNoteDto { Title = " ", Body = "body" };

            // Act / Assert
            var ex = await Assert.ThrowsAsync<ValidationException>(async Task () => await sut.CreateNote(Guid.NewGuid(),dto));
            Assert.Equal("Note title is required", ex.Message);
            A.CallTo(() => noteRepository.CreateNote(A<Note>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateNote_MissingBody_ShouldCreateANoteWithNullBody()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            var sut = new NoteService(noteRepository, folderRepository);

            var dto = new CreateNoteDto { Title = "title", Body = null };

            // Assert
            var result = await sut.CreateNote(Guid.NewGuid(), dto);

            // Act
            Assert.Equal(dto.Title, result.Title);
            Assert.Null(result.Body);
            A.CallTo(() => noteRepository.CreateNote(A<Note>.Ignored)).MustHaveHappened();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            A.CallTo(() => noteRepository.GetNote(A<Guid>.Ignored)).Returns(Task.FromResult<Note?>(null));
            var sut = new NoteService(noteRepository, folderRepository);

            // Act / Assert
            var ex = await Assert.ThrowsAsync<NotFoundException>(async Task () => await sut.UpdateNote(Guid.NewGuid(), new UpdateNoteDto()));
            Assert.Equal("Note doesn`t exist", ex.Message);
            A.CallTo(() => noteRepository.UpdateNote(A<Note>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteExistsAndTitleExists_ShouldUpdateTitleAndCallRepo()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            var note = new Note { Id = Guid.NewGuid(), Title = "Old", Body = "OldBody" };
            A.CallTo(() => noteRepository.GetNote(A<Guid>.Ignored)).Returns(note);
            A.CallTo(() => noteRepository.UpdateNote(A<Note>.Ignored)).Returns(Task.CompletedTask);
            var sut = new NoteService(noteRepository, folderRepository);

            // Act
            var updated = await sut.UpdateNote(note.Id, new UpdateNoteDto { Title = "New", Body = null });

            // Assert
            Assert.Equal("New", updated.Title);
            Assert.Equal("OldBody", updated.Body);
            A.CallTo(() => noteRepository.UpdateNote(note)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteExistsAndBodyExists_ShouldUpdateBodyAndCallRepo()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            var note = new Note { Id = Guid.NewGuid(), Title = "Old", Body = "OldBody" };
            A.CallTo(() => noteRepository.GetNote(A<Guid>.Ignored)).Returns(note);
            A.CallTo(() => noteRepository.UpdateNote(A<Note>.Ignored)).Returns(Task.CompletedTask);
            var sut = new NoteService(noteRepository, folderRepository);

            // Act
            var updated = await sut.UpdateNote(note.Id, new UpdateNoteDto { Title = null, Body = "NewBody" });

            // Assert
            Assert.Equal(note.Title, updated.Title);
            Assert.Equal("NewBody", updated.Body);
            A.CallTo(() => noteRepository.UpdateNote(note)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteExistsAndBodyIsNullAndTitleIsNull_ShouldThrowValidationException()
        {
            // Arrange
            var noteRepository = A.Fake<INoteRepository>();
            var folderRepository = A.Fake<IFolderRepository>();
            var note = new Note { Id = Guid.NewGuid(), Title = "Old", Body = "OldBody" };
            A.CallTo(() => noteRepository.GetNote(A<Guid>.Ignored)).Returns(note);
            var sut = new NoteService(noteRepository, folderRepository);



            // Assert  / Act
            var e = await Assert.ThrowsAsync<ValidationException>(async ()=>await sut.UpdateNote(note.Id, new UpdateNoteDto { Title = null, Body = null }));
            Assert.Equal("Body and Title are empty!", e.Message);
            A.CallTo(() => noteRepository.UpdateNote(note)).MustNotHaveHappened();
        }
    }
}
