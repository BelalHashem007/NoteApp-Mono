using FakeItEasy;
using NoteApp.Api.Entities;
using NoteApp.Api.DTOs;
using NoteApp.Api.Repositories;
using NoteApp.Api.Services;
namespace NoteApi.UnitTests.Services
{
    public class NoteServiceTests
    {
        [Fact]
        public async Task GetNote_WhenNoteDoesNotExist_ShouldThrowArgumentException()
        {
            // Arrange
            var repo = A.Fake<INoteRepository>();
            A.CallTo(() => repo.GetNote(A<Guid>.Ignored)).Returns(Task.FromResult<Note?>(null));
            var sut = new NoteService(repo);

            // Act / Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(async Task ()=> await sut.GetNote(Guid.NewGuid()));
            Assert.Equal("Note doesn`t exist", exception.Message);
            A.CallTo(() => repo.GetNote(A<Guid>.Ignored)).MustHaveHappened();
        }

        [Fact]
        public async Task GetNote_WhenNoteExists_ShouldReturnTheNote()
        {
            // Arrange
            var repo = A.Fake<INoteRepository>();
            var note = new Note { Title="test title", Body= "test body"};
            A.CallTo(() => repo.GetNote(A<Guid>.Ignored)).Returns(note);
            var sut = new NoteService(repo);

            // Act
            var returnedNote = await sut.GetNote(Guid.NewGuid());

            // Assert
            Assert.NotNull(returnedNote);
            Assert.Equal(note.Title, returnedNote.Title);
            Assert.Equal(note.Body, returnedNote.Body);
            A.CallTo(() => repo.GetNote(A<Guid>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetNotes_WhenCalled_ShouldAlwaysReturnAllNotes()
        {
            // Arrange
            var repo = A.Fake<INoteRepository>();
            var note1 = new Note { Title = "1", Body = "body 1"};
            var note2 = new Note { Title = "2", Body = "body 2"};
            A.CallTo(() => repo.GetNotes()).Returns(new List<Note> { note1,note2});
            var sut = new NoteService(repo);

            // Act 
            var result = await sut.GetNotes();

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
        public async Task DeleteNote_WhenNoteDoesNotExist_ShouldThrowArgumentException()
        {
            // Arrange
            var repo = A.Fake<INoteRepository>();
            A.CallTo(() => repo.GetNote(A<Guid>.Ignored)).Returns(Task.FromResult<Note?>(null));
            var sut = new NoteService(repo);

            // Act / Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(async Task () => await sut.DeleteNote(Guid.NewGuid()));
            Assert.Equal("Note doesn`t exist", exception.Message);
            A.CallTo(() => repo.DeleteNote(A<Guid>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task DeleteNote_WhenNoteExists_ShouldDeleteTheNote()
        {
            // Arrange
            var repo = A.Fake<INoteRepository>();
            var note = new Note {Id = Guid.NewGuid(), Title = "test title", Body = "test body" };
            A.CallTo(() => repo.GetNote(A<Guid>.Ignored)).Returns(note);
            var sut = new NoteService(repo);
            // Act
             await sut.DeleteNote(note.Id);

            // Assert
            A.CallTo(() => repo.DeleteNote(note.Id)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task CreateNote_WhenDtoIsValid_ShouldCreateNoteAndCallRepo()
        {
            // Arrange
            var repo = A.Fake<INoteRepository>();
            A.CallTo(() => repo.CreateNote(A<Note>.Ignored)).Returns(Task.FromResult(new Note()));
            var sut = new NoteService(repo);

            var dto = new CreateNoteDto { Title = "title", Body = "body" };

            // Act
            var result = await sut.CreateNote(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("title", result.Title);
            Assert.Equal("body", result.Body);
            A.CallTo(() => repo.CreateNote(A<Note>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task CreateNote_MissingTitle_ShouldThrowArgumentException()
        {
            // Arrange
            var repo = A.Fake<INoteRepository>();
            var sut = new NoteService(repo);

            var dto = new CreateNoteDto { Title = " ", Body = "body" };

            // Act / Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(async Task () => await sut.CreateNote(dto));
            Assert.Equal("Note name is required", ex.Message);
            A.CallTo(() => repo.CreateNote(A<Note>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateNote_MissingBody_ShouldThrowArgumentException()
        {
            // Arrange
            var repo = A.Fake<INoteRepository>();
            var sut = new NoteService(repo);

            var dto = new CreateNoteDto { Title = "title", Body = null };

            // Act / Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(async Task () => await sut.CreateNote(dto));
            Assert.Equal("Note body is required", ex.Message);
            A.CallTo(() => repo.CreateNote(A<Note>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteDoesNotExist_ShouldThrowArgumentException()
        {
            // Arrange
            var repo = A.Fake<INoteRepository>();
            A.CallTo(() => repo.GetNote(A<Guid>.Ignored)).Returns(Task.FromResult<Note?>(null));
            var sut = new NoteService(repo);

            // Act / Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(async Task () => await sut.UpdateNote(Guid.NewGuid(), new UpdateNoteDto()));
            Assert.Equal("Note doesn`t exist", ex.Message);
            A.CallTo(() => repo.UpdateNote(A<Note>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteExists_ShouldUpdateFieldsAndCallRepo()
        {
            // Arrange
            var repo = A.Fake<INoteRepository>();
            var note = new Note { Id = Guid.NewGuid(), Title = "Old", Body = "OldBody" };
            A.CallTo(() => repo.GetNote(A<Guid>.Ignored)).Returns(note);
            A.CallTo(() => repo.UpdateNote(A<Note>.Ignored)).Returns(Task.CompletedTask);
            var sut = new NoteService(repo);

            // Act
            var updated = await sut.UpdateNote(note.Id, new UpdateNoteDto { Title = "New", Body = null });

            // Assert
            Assert.Equal("New", updated.Title);
            Assert.Equal("OldBody", updated.Body);
            A.CallTo(() => repo.UpdateNote(note)).MustHaveHappenedOnceExactly();
        }
    }
}
