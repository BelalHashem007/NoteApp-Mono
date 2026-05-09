using FakeItEasy;
using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Services;
using System.Linq.Expressions;
using Microsoft.Extensions.Configuration;
using System;
namespace NoteApi.UnitTests.Services
{
    public class FolderServiceTests
    {

        [Fact]
        public async Task GetFolders_WhenCalled_ReturnsAllFolders()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var folder = new Folder { FolderName = "TestFolder 1" };
            var folder2 = new Folder { FolderName = "TestFolder 2" };
            A.CallTo(() => unitOfWork.Folders.FindAll(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<IEnumerable<Folder>>([folder, folder2]));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var result = await sut.GetFolders("100", CancellationToken.None);

            //assert
            Assert.Equal(2, result.Count());
            Assert.Collection(result,
                item =>
                {
                    Assert.Equal("TestFolder 1", item.FolderName);
                },
                item =>
                {
                    Assert.Equal("TestFolder 2", item.FolderName);
                }
            );
            A.CallTo(() => unitOfWork.Folders.FindAll(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetFolder_WhenFolderIsNotFound_ThrowsNotFoundException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Folder?>(null));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var e = await Assert.ThrowsAsync<NotFoundException>(async () => await sut.GetFolder("1", Guid.NewGuid(), CancellationToken.None));

            //assert
            Assert.Equal("Folder does not exist", e.Message);
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetFolder_WhenFolderIsFound_ReturnsFolder()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var folder = new Folder { FolderName = "TestFolder" };
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Folder?>(folder));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var result = await sut.GetFolder("1", Guid.NewGuid(), CancellationToken.None);

            //assert
            Assert.Equal(folder.FolderName, result.FolderName);
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task CreateFolder_WhenFolderNameIsNull_ThrowsValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var dto = new CreateFolderViewModel { FolderName = null };
            var sut = new FolderService(unitOfWork, dapper);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.CreateFolder("1", dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Add(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateFolder_WhenFolderNameIsEmptyString_ThrowsValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var dto = new CreateFolderViewModel { FolderName = "" };
            var sut = new FolderService(unitOfWork, dapper);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.CreateFolder("1", dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Add(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateFolder_WhenFolderNameIsWhiteSpaces_ThrowsValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var dto = new CreateFolderViewModel { FolderName = "   " };
            var sut = new FolderService(unitOfWork, dapper);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.CreateFolder("1", dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Add(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateFolder_WhenFolderNameExceeds50Chars_ThrowsValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var dto = new CreateFolderViewModel { FolderName = new string('a', 51) };
            var sut = new FolderService(unitOfWork, dapper);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.CreateFolder("1", dto, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Add(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateFolder_WhenFolderNameIsValidString_CreatesFolder()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var dto = new CreateFolderViewModel { FolderName = "Asp.Net Core Web Api" };
            A.CallTo(() => unitOfWork.Folders.Add(A<Folder>.Ignored, A<CancellationToken>.Ignored)).Returns(Task.FromResult(new Folder()));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var result = await sut.CreateFolder("1", dto, CancellationToken.None);

            //assert
            Assert.Equal(dto.FolderName, result.FolderName);
            A.CallTo(() => unitOfWork.Folders.Add(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task CreateFolder_WhenParentIdProvidedButMissing_ThrowsValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var parentId = Guid.NewGuid();
            var dto = new CreateFolderViewModel { FolderName = "Valid", ParentId = parentId };
            A.CallTo(() => unitOfWork.Folders.GetById(parentId, A<CancellationToken>.Ignored)).Returns(Task.FromResult<Folder?>(null));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var e = await Assert.ThrowsAsync<ValidationException>(async () => await sut.CreateFolder("1", dto, CancellationToken.None));

            //assert
            Assert.Equal("Parent folder does not exist", e.Message);
            A.CallTo(() => unitOfWork.Folders.GetById(parentId, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Folders.Add(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task CreateFolder_WhenParentIdProvidedAndExists_CreatesFolder()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var parentId = Guid.NewGuid();
            var dto = new CreateFolderViewModel { FolderName = "Valid", ParentId = parentId };
            A.CallTo(() => unitOfWork.Folders.GetById(parentId, A<CancellationToken>.Ignored)).Returns(Task.FromResult<Folder?>(new Folder()));
            A.CallTo(() => unitOfWork.Folders.Add(A<Folder>.Ignored, A<CancellationToken>.Ignored)).Returns(Task.FromResult(new Folder()));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var result = await sut.CreateFolder("1", dto, CancellationToken.None);

            //assert
            Assert.Equal(dto.FolderName, result.FolderName);
            A.CallTo(() => unitOfWork.Folders.GetById(parentId, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Folders.Add(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdateFolder_WhenFolderNameToUpdateIsNull_ThrowsValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var updatedFolder = new UpdateFolderViewModel { FolderName = null };
            var sut = new FolderService(unitOfWork, dapper);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.UpdateFolder("1", Guid.NewGuid(), updatedFolder, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Folders.Update(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateFolder_WhenFolderNameToUpdateIsEmptyString_ThrowsValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var updatedFolder = new UpdateFolderViewModel { FolderName = "" };
            var sut = new FolderService(unitOfWork, dapper);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.UpdateFolder("1", Guid.NewGuid(), updatedFolder, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Folders.Update(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateFolder_WhenFolderNameToUpdateIsWhiteSpaces_ThrowsValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var updatedFolder = new UpdateFolderViewModel { FolderName = "   " };
            var sut = new FolderService(unitOfWork, dapper);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.UpdateFolder("1", Guid.NewGuid(), updatedFolder, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Folders.Update(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateFolder_WhenFolderNameToUpdateExceeds50Chars_ThrowsValidationException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var updatedFolder = new UpdateFolderViewModel { FolderName = new string('a', 51) };
            var sut = new FolderService(unitOfWork, dapper);

            //act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.UpdateFolder("1", Guid.NewGuid(), updatedFolder, CancellationToken.None));

            //assert
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Folders.Update(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateFolder_WhenFolderNameToUpdateIsValidAndFolderToUpdateDoesNotExist_ThrowsNotFoundException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var updatedFolder = new UpdateFolderViewModel { FolderName = "test" };
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Folder?>(null));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var e = await Assert.ThrowsAsync<NotFoundException>(async () => await sut.UpdateFolder("1", Guid.NewGuid(), updatedFolder, CancellationToken.None));

            //assert
            Assert.Equal("Folder does not exist", e.Message);
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Folders.Update(A<Folder>.Ignored, A<CancellationToken>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateFolder_WhenFolderNameToUpdateIsValidAndFolderToUpdateDoesExist_UpdatesFolderName()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var updatedFolder = new UpdateFolderViewModel { FolderName = "test" };
            var existingFolder = new Folder { FolderName = "old" };
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Folder?>(existingFolder));
            A.CallTo(() => unitOfWork.Folders.Update(existingFolder, A<CancellationToken>.Ignored)).Returns(existingFolder);
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var result = await sut.UpdateFolder("1", Guid.NewGuid(), updatedFolder, CancellationToken.None);

            //assert
            Assert.Equal(updatedFolder.FolderName, result.FolderName);
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Folders.Update(existingFolder, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => unitOfWork.Complete(A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task DeleteFolder_WhenFolderDoesNotExist_ThrowsNotFoundException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Folder?>(null));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var e = await Assert.ThrowsAsync<NotFoundException>(async () => await sut.DeleteFolder("1", Guid.NewGuid(), CancellationToken.None));

            //assert
            Assert.Equal("No folder to delete", e.Message);
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => dapper.DeleteFolderRecursively(A<Guid>.Ignored, A<string>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task DeleteFolder_WhenFolderDoesExistAndDapperSucceeds_DeletesFolder()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var folderToDelete = new Folder { FolderName = "test" };
            var folderId = Guid.NewGuid();
            var userId = "1";
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Folder?>(folderToDelete));
            A.CallTo(() => dapper.DeleteFolderRecursively(folderId, userId)).Returns(Task.FromResult(true));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            await sut.DeleteFolder(userId, folderId, CancellationToken.None);

            //assert
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => dapper.DeleteFolderRecursively(folderId, userId)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task DeleteFolder_WhenFolderDoesExistAndDapperFails_ThrowsException()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var folderToDelete = new Folder { FolderName = "test" };
            var folderId = Guid.NewGuid();
            var userId = "1";
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<Folder?>(folderToDelete));
            A.CallTo(() => dapper.DeleteFolderRecursively(folderId, userId)).Returns(Task.FromResult(false));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var e = await Assert.ThrowsAsync<Exception>(async () => await sut.DeleteFolder(userId, folderId, CancellationToken.None));

            //assert
            Assert.Equal("Could not delete folder", e.Message);
            A.CallTo(() => unitOfWork.Folders.Find(A<Expression<Func<Folder, bool>>>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => dapper.DeleteFolderRecursively(folderId, userId)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetAllFolderItems_WhenFoldersContainParents_ReturnsRootFoldersWithSubFolders()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var userId = "1";
            var rootId = Guid.NewGuid();
            var childId = Guid.NewGuid();
            var root = new FoldersAndNotesViewModel { Id = rootId, FolderName = "root", ParentId = null };
            var child = new FoldersAndNotesViewModel { Id = childId, FolderName = "child", ParentId = rootId };
            A.CallTo(() => unitOfWork.Folders.GetAllItems(userId)).Returns(Task.FromResult(new List<FoldersAndNotesViewModel> { root, child }));
            A.CallTo(() => unitOfWork.Tags.FindAll(A<Expression<Func<Tag, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<IEnumerable<Tag>>([]));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var result = await sut.GetAllFolderItems(userId);

            //assert
            Assert.Single(result.Folders);
            Assert.Equal(rootId, result.Folders[0].Id);
            Assert.Single(result.Folders[0].SubFolders);
            Assert.Equal(childId, result.Folders[0].SubFolders[0].Id);
            Assert.Equal("child", result.Folders[0].SubFolders[0].FolderName);
            A.CallTo(() => unitOfWork.Folders.GetAllItems(userId)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetAllFolderItems_WhenCalled_IncludesUserTags()
        {
            //arrange
            var unitOfWork = A.Fake<IUnitOfWork>();
            var config = A.Fake<IConfiguration>();
            var dapper = A.Fake<AppDbContextDapper>(o => o.WithArgumentsForConstructor(() => new AppDbContextDapper(config)));
            var userId = "1";
            var rootId = Guid.NewGuid();
            var root = new FoldersAndNotesViewModel { Id = rootId, FolderName = "root", ParentId = null };
            var tags = new List<Tag> { new Tag { Name = "t1", UserId = userId } };
            A.CallTo(() => unitOfWork.Folders.GetAllItems(userId)).Returns(Task.FromResult(new List<FoldersAndNotesViewModel> { root }));
            A.CallTo(() => unitOfWork.Tags.FindAll(A<Expression<Func<Tag, bool>>>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.FromResult<IEnumerable<Tag>>(tags));
            var sut = new FolderService(unitOfWork, dapper);

            //act
            var result = await sut.GetAllFolderItems(userId);

            //assert
            Assert.Single(result.Tags);
            Assert.Equal("t1", result.Tags[0].Name);
            Assert.Equal(userId, result.Tags[0].UserId);
            A.CallTo(() => unitOfWork.Tags.FindAll(A<Expression<Func<Tag, bool>>>.Ignored, A<CancellationToken>.Ignored)).MustHaveHappenedOnceExactly();
        }
    }
}
