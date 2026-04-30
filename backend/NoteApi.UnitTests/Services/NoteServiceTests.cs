
using FakeItEasy;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Services;
using System.Linq.Expressions;

namespace NoteApi.UnitTests.Services
{
    public class NoteServiceTests 
    {
        [Fact]
        public async Task GetNotes_WhenCalled_ShouldAlwaysReturnAllNotes()
        {
            //Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var note1 = new Note { Title = "TestNote 1" };
            var note2 = new Note { Title = "TestNote 2" };
            A.CallTo(() => unitOfWork.Notes.FindAll(A<Expression<Func<Note, bool>>>.Ignored)).Returns(Task.FromResult<IEnumerable<Note>>([note1, note2]));
            var sut = new NoteService(unitOfWork);

            // Act 
            var result = await sut.GetNotes("100", Guid.NewGuid() , CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Collection(result,
                item =>
                {
                    Assert.Equal("TestNote 1", item.Title);
                },
                item =>
                {
                    Assert.Equal("TestNote 2", item.Title);
                }
            );
            A.CallTo(() => unitOfWork.Notes.FindAll(A<Expression<Func<Note, bool>>>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetNote_WhenNoteIsNotFound_ShouldThrowNotFoundException()
        {
            //Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).Returns(Task.FromResult<Note?>(null));
            var sut = new NoteService(unitOfWork);

            // Act / Assert
            var e = await Assert.ThrowsAsync<NotFoundException>(async () => await sut.GetNote("1", Guid.NewGuid() , Guid.NewGuid(), CancellationToken.None));
            Assert.Equal("Note does not exist", e.Message);
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetNoter_WhenNoteIsFound_ShouldReturnNote()
        {
            //Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var note = new Note { Title = "TestNote" };
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).Returns(Task.FromResult<Note?>(note));
            var sut = new NoteService(unitOfWork);

            // Act 
            var result = await sut.GetNote("1", Guid.NewGuid() , Guid.NewGuid(), CancellationToken.None);

            // Assert
            Assert.Equal(note.Title, result.Title);
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task CreateNote_WhenTitleIsNull_ShouldThrowValidationException()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel { Title = null };
            var sut = new NoteService(unitOfWork);

            // Assert / Act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None));
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete()).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateNote_WhenTitleIsEmpty_ShouldThrowValidationException()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel { Title = "" };
            var sut = new NoteService(unitOfWork);

            // Assert / Act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None));
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete()).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateNote_WhenTitleIsWhiteSpaces_ShouldThrowValidationException()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel { Title = "    " };
            var sut = new NoteService(unitOfWork);

            // Assert / Act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None));
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete()).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateNote_WhenTitleIsLongerThan50Characters_ShouldThrowValidationException()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel { Title = "abcdefghikabcdefghikabcdefghikabcdefghikabcdefghikabcdefghik" };
            var sut = new NoteService(unitOfWork);

            // Assert / Act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None));
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete()).MustNotHaveHappened();

        }
        [Fact]
        public async Task CreateNote_WhenFolderDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel { Title = "test" };
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored)).Returns(Task.FromResult<Folder?>(null));
            var sut = new NoteService(unitOfWork);

            // Assert / Act
            await Assert.ThrowsAsync<NotFoundException>(async () => await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None));
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete()).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateNote_WhenFolderDoesExistAndNoteTitleIsValidString_ShouldCreateNote()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new CreateNoteViewModel { Title = "test" };
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored)).Returns(Task.FromResult<Folder?>(new Folder()));
            var sut = new NoteService(unitOfWork);

            // Assert 
            var result = await sut.CreateNote("1", Guid.NewGuid(), dto, CancellationToken.None);


            // Act
            Assert.Equal(dto.Title, result.Title);
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Add(A<Note>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete()).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteTitleIsNullAndBodyIsNull_ShouldThrowValidationException()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Title = null, Body = null };
            var sut = new NoteService(unitOfWork);

            // Assert / Act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.UpdateNote("1", Guid.NewGuid(), Guid.NewGuid() , dto, CancellationToken.None));
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete()).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteTitleIsMoreThan50Characters_ShouldThrowValidationException()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Title = "abcdefghikabcdefghikabcdefghikabcdefghikabcdefghikabcdefghik" };
            var sut = new NoteService(unitOfWork);

            // Assert / Act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.UpdateNote("1", Guid.NewGuid(), Guid.NewGuid() , dto, CancellationToken.None));
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete()).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteToUpdateDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Title = "test" };
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).Returns(Task.FromResult<Note?>(null));
            var sut = new NoteService(unitOfWork);

            // Assert / Act
            await Assert.ThrowsAsync<NotFoundException>(async () => await sut.UpdateNote("1", Guid.NewGuid(), Guid.NewGuid() , dto, CancellationToken.None));
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete()).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteToUpdateDoesExistAndTitleExistAndBodyIsNull_ShouldUpdateTitleOnly()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Title = "test" };
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).Returns(Task.FromResult<Note?>(new Note { Title= "title", Body = "body"}));
            var sut = new NoteService(unitOfWork);

            // Assert 
            var result = await sut.UpdateNote("1", Guid.NewGuid(), Guid.NewGuid() , dto, CancellationToken.None);


            // Act
            Assert.Equal(dto.Title, result.Title);
            Assert.NotEqual(dto.Body, result.Body);
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete()).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteToUpdateDoesExistAndTitleIsNullAndBodyExist_ShouldUpdateBodyOnly()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Body = "test" };
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).Returns(Task.FromResult<Note?>(new Note { Title = "title", Body = "body" }));
            var sut = new NoteService(unitOfWork);

            // Assert 
            var result = await sut.UpdateNote("1", Guid.NewGuid(), Guid.NewGuid() , dto, CancellationToken.None);


            // Act
            Assert.Equal(dto.Body, result.Body);
            Assert.NotEqual(dto.Title, result.Title);
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete()).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdateNote_WhenNoteToUpdateDoesExistAndTitleExistAndBodyExist_ShouldUpdateTitleAndBody()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var dto = new UpdateNoteViewModel { Body = "test", Title = "test title" };
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).Returns(Task.FromResult<Note?>(new Note { Title = "title", Body = "body" }));
            var sut = new NoteService(unitOfWork);

            // Assert 
            var result = await sut.UpdateNote("1", Guid.NewGuid(), Guid.NewGuid() , dto, CancellationToken.None);


            // Act
            Assert.Equal(dto.Body, result.Body);
            Assert.Equal(dto.Title, result.Title);
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Update(A<Note>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete()).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task DeleteNote_WhenNoteToDeleteDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).Returns(Task.FromResult<Note?>(null));
            var sut = new NoteService(unitOfWork);

            // Assert / Act
            await Assert.ThrowsAsync<NotFoundException>(async () => await sut.DeleteNote("1", Guid.NewGuid(), Guid.NewGuid(), CancellationToken.None));
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Delete(A<Note>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete()).MustNotHaveHappened();
        }

        [Fact]
        public async Task DeleteNote_WhenNoteToDeleteDoesExist_ShouldDeleteNote()
        {
            // Arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).Returns(Task.FromResult<Note?>(new Note()));
            var sut = new NoteService(unitOfWork);

            // Assert 
            await sut.DeleteNote("1", Guid.NewGuid(), Guid.NewGuid(), CancellationToken.None);

            // Act
            A.CallTo(() => unitOfWork.Notes.Find(A<Expression<Func<Note, bool>>>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Notes.Delete(A<Note>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete()).MustHaveHappenedOnceExactly();
        }

    }
    
}
