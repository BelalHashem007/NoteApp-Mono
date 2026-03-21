using FakeItEasy;
using NoteApp.Api.DTOs;
using NoteApp.Api.Entities;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Services;
namespace NoteApi.UnitTests.Services
{
    public class FolderServiceTests
    {
        [Fact]
        public async Task CreateFolder_WhenFolderNameIsNull_ShouldThrowValidationException()
        {
            // Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            var dto = new CreateFolderDto { FolderName = null};
            var sut = new FolderService(folderRepository);

            // Assert / Act
            var e = await Assert.ThrowsAsync<ValidationException>(async () => await sut.CreateFolder(dto));
            Assert.Equal("FolderName is required", e.Message);
            A.CallTo(() => folderRepository.CreateFolder(A<Folder>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateFolder_WhenFolderNameIsWhiteSpaces_ShouldThrowValidationException()
        {
            // Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            var dto = new CreateFolderDto { FolderName = "   " };
            var sut = new FolderService(folderRepository);

            // Assert / Act
            var e = await Assert.ThrowsAsync<ValidationException>(async () => await sut.CreateFolder(dto));
            Assert.Equal("FolderName is required", e.Message);
            A.CallTo(() => folderRepository.CreateFolder(A<Folder>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateFolder_WhenFolderNameIsValidString_ShouldCreateFolder()
        {
            // Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            var dto = new CreateFolderDto { FolderName = "Asp.Net Core Web Api" };
            var sut = new FolderService(folderRepository);

            // Assert 
            var result = await sut.CreateFolder(dto);

            // Act
            Assert.Equal(dto.FolderName, result.Name);
            A.CallTo(() => folderRepository.CreateFolder(A<Folder>.Ignored)).MustHaveHappened();
        }

        [Fact]
        public async Task DeleteFolder_WhenFolderDoesNotExist_ShouldThrowNotFoundException()
        {
            //Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            A.CallTo(() => folderRepository.GetFolder(A<Guid>.Ignored)).Returns(Task.FromResult<Folder?>(null));
            var sut = new FolderService(folderRepository);

            // Act / Assert
            var e = await Assert.ThrowsAsync<NotFoundException>(async ()=> await sut.DeleteFolder(Guid.NewGuid()));
            Assert.Equal("No folder to delete", e.Message);
            A.CallTo(() => folderRepository.DeleteFolder(A<Guid>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task DeleteFolder_WhenFolderDoesExists_ShouldDeleteFolder()
        {
            //Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            A.CallTo(() => folderRepository.GetFolder(A<Guid>.Ignored)).Returns(Task.FromResult<Folder?>(new Folder()));
            var sut = new FolderService(folderRepository);

            // Act 
            await sut.DeleteFolder(Guid.NewGuid());

            // Assert
            A.CallTo(() => folderRepository.DeleteFolder(A<Guid>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetFolder_WhenFolderIsNotFound_ShouldThrowNotFoundException()
        {
            //Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            A.CallTo(() => folderRepository.GetFolder(A<Guid>.Ignored)).Returns(Task.FromResult<Folder?>(null));
            var sut = new FolderService(folderRepository);

            // Act / Assert
            var e = await Assert.ThrowsAsync<NotFoundException>(async ()=> await sut.GetFolder(Guid.NewGuid()));
            Assert.Equal("Folder doesn`t exist", e.Message);
            A.CallTo(() => folderRepository.GetFolder(A<Guid>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetFolder_WhenFolderIsFound_ShouldReturnFolder()
        {
            //Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            var folder = new Folder { Name = "TestFolder" };
            A.CallTo(() => folderRepository.GetFolder(A<Guid>.Ignored)).Returns(Task.FromResult<Folder?>(folder));
            var sut = new FolderService(folderRepository);

            // Act 
            var result = await sut.GetFolder(Guid.NewGuid());

            // Assert
            Assert.Equal(folder.Name, result.Name);
            A.CallTo(() => folderRepository.GetFolder(A<Guid>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetFolders_WhenCalled_ShouldAlwaysReturnAllFolders()
        {
            //Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            var folder = new Folder { Name = "TestFolder 1" };
            var folder2 = new Folder { Name = "TestFolder 2" };
            A.CallTo(() => folderRepository.GetFolders()).Returns(Task.FromResult(new List<Folder> { folder,folder2}));
            var sut = new FolderService(folderRepository);

            // Act 
            var result = await sut.GetFolders();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Collection(result,
                item =>
                {
                    Assert.Equal("TestFolder 1", item.Name);
                },
                item =>
                {
                    Assert.Equal("TestFolder 2", item.Name);
                }
            );
            A.CallTo(() => folderRepository.GetFolders()).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdateFolder_WhenFolderDoesNotExist_ShouldThrowNotFoundException()
        {
            //Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            A.CallTo(() => folderRepository.GetFolder(A<Guid>.Ignored)).Returns(Task.FromResult<Folder?>(null));
            var sut = new FolderService(folderRepository);

            // Act / Assert
            var e = await Assert.ThrowsAsync<NotFoundException>(async ()=> await sut.UpdateFolder(Guid.NewGuid(),new UpdateFolderDto { FolderName = "test"}));
            Assert.Equal("Folder doesn`t exist", e.Message);
            A.CallTo(() => folderRepository.UpdateFolder(A<Folder>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateFolder_WhenFolderExistsAndFolderNameIsNull_ShouldThrowValidationException()
        {
            //Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            A.CallTo(() => folderRepository.GetFolder(A<Guid>.Ignored)).Returns(Task.FromResult<Folder?>(new Folder()));
            var sut = new FolderService(folderRepository);

            // Act / Assert
            var e = await Assert.ThrowsAsync<ValidationException>(async () => await sut.UpdateFolder(Guid.NewGuid(), new UpdateFolderDto { FolderName = null }));
            Assert.Equal("FolderName is required", e.Message);
            A.CallTo(() => folderRepository.UpdateFolder(A<Folder>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateFolder_WhenFolderExistsAndFolderNameIsWhiteSpaces_ShouldThrowValidationException()
        {
            //Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            A.CallTo(() => folderRepository.GetFolder(A<Guid>.Ignored)).Returns(Task.FromResult<Folder?>(new Folder()));
            var sut = new FolderService(folderRepository);

            // Act / Assert
            var e = await Assert.ThrowsAsync<ValidationException>(async () => await sut.UpdateFolder(Guid.NewGuid(), new UpdateFolderDto { FolderName = "   " }));
            Assert.Equal("FolderName is required", e.Message);
            A.CallTo(() => folderRepository.UpdateFolder(A<Folder>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateFolder_WhenFolderExistsAndFolderNameIsValidString_ShouldUpdateFolderName()
        {
            //Arrange
            var folderRepository = A.Fake<IFolderRepository>();
            var oldFolder = new Folder { Name = "OldFolder" };
            A.CallTo(() => folderRepository.GetFolder(A<Guid>.Ignored)).Returns(Task.FromResult<Folder?>(oldFolder));
            var sut = new FolderService(folderRepository);

            // Act
            var result = await sut.UpdateFolder(Guid.NewGuid(), new UpdateFolderDto { FolderName = "NewFolder" });

            // Assert
            Assert.Equal("NewFolder", result.Name);
            A.CallTo(() => folderRepository.UpdateFolder(A<Folder>.Ignored)).MustHaveHappenedOnceExactly();
        }
    }
}
