using FakeItEasy;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NoteApp.Api.Configuration;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;
using NoteApp.Api.Services;

namespace NoteApp.UnitTests.Services
{
    //TODO: Test refresh and externalLogin methods
    public class AuthServiceTests
    {
        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("     ")]
        [InlineData("ahmedwael")]
        [InlineData("ahmedwael@google.comG7!kP2#zL9qR5*vN1xA8mJ4tW6@bY3fH0sU2&pI9oK5^dX1nC7mB4vQ8zL3gJ6hK2jL9sD4fG1hA7sS3dD5fF8gG0hH2jJ4kK6lL9qQ1wW3eE5rR7tT9yY2uU4iI6oO8pP0aA1sS2dD3fF4gG5hH6jJ7kK8lL9zZ0xX1cC2vV3bB4nN5mM6qQ7wW8eE9rR0tT1yY2uU3iI4oO5pP6aA7sS8dD9fF0gG1hH2jJ3kK4lL5zZ6xX7cC8vV9bB0nN1mM2qQ3wW4eE5rR6tT7yY8uU9iI0oOpP1aAsS2dD3f")]
        //Email must be not empty, must be email and have a max length of 256
        //Valid example e.g. ahmedwael2@google.com
        public async Task Login_WhenEmailIsInvalid_ShouldThrowValidationException(string email)
        {
            //Arrange
            var authRepository = A.Fake<IAuthRepository>();
            var dto = new LoginViewModel { Email = email, Password = "123Ahmed@123" };
            var sut = new AuthService(
                authRepository,
                A.Fake<IOptions<JwtOptions>>(),
                A.Fake<ITokenService>(),
                A.Fake<ILogger<AuthService>>(),
                A.Fake<IMemoryCache>()
                );
            //Assert / Act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.Login(dto));
            A.CallTo(() => authRepository.GetApplicationUser(dto)).MustNotHaveHappened();
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("     ")]
        [InlineData("123")]
        [InlineData("123abc")]
        [InlineData("123Abc")]
        [InlineData("123ab@")]
        [InlineData("U2&pI9oK5^dX1nC7mB4vQ8zL3gJ6hK2jL9sD4fG1hA7sS3dD5fF8gG0hH2jJ4kK6lL9qQ1wW3eE5rR7tT9yY2uU4iI6oO8pP0aA1sS2dD3fF4gG5hH6jJ7kK8lL9zZ0xX1cC2vV3bB4nN5mM6qQ7wW8eE9rR0tT1yY2uU3iI4oO5pP6aA7sS8dD9fF0gG1hH2jJ3kK4lL5zZ6xX7cC8vV9bB0nN1mM2qQ3wW4eE5rR6tT7yY8uU9iI0oOpP1aAsS2dD3f")]
        //Password must not be empty, has a max length of 100, min length of 6 and contains small letter , capital letter, number and symbol
        //Valid example e.g. 123Ahmed@123
        public async Task Login_WhenPasswordIsInvalid_ShouldThrowValidationException(string password)
        {
            //Arrange
            var authRepository = A.Fake<IAuthRepository>();
            var dto = new LoginViewModel { Email = "ahmedwael2@google.com", Password = password };
            var sut = new AuthService(
                authRepository,
                A.Fake<IOptions<JwtOptions>>(),
                A.Fake<ITokenService>(),
                A.Fake<ILogger<AuthService>>(),
                A.Fake<IMemoryCache>()
                );
            //Assert / Act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.Login(dto));
            A.CallTo(() => authRepository.GetApplicationUser(dto)).MustNotHaveHappened();
        }

        [Fact]
        public async Task Login_WhenPasswordAndEmailIsValidAndUserDoesNotExist_ShouldThrowUnauthorizedException()
        {
            //Arrange
            var authRepository = A.Fake<IAuthRepository>();
            A.CallTo(() => authRepository.GetApplicationUser(A<LoginViewModel>.Ignored)).Returns(Task.FromResult<ApplicationUser?>(null));
            var dto = new LoginViewModel { Email = "ahmedwael2@google.com", Password = "123Ahmed@123" };
            var sut = new AuthService(
                authRepository,
                A.Fake<IOptions<JwtOptions>>(),
                A.Fake<ITokenService>(),
                A.Fake<ILogger<AuthService>>(),
                A.Fake<IMemoryCache>()
                );
            //Assert / Act
            var e = await Assert.ThrowsAsync<UnauthorizedException>(async () => await sut.Login(dto));
            Assert.Equal("Invalid credentials", e.Message);
            A.CallTo(() => authRepository.GetApplicationUser(dto)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task Login_WhenPasswordAndEmailIsValidAndUserDoesExistAndThereIsNoActiveRefreshTokens_ShouldCreateNewRefreshTokenAndLoginUser()
        {
            //Arrange
            var authRepository = A.Fake<IAuthRepository>();
            var taskService = A.Fake<ITokenService>();
            var user = new ApplicationUser
            {
                Email = "ahmedwael2@google.com",
                RefreshTokens = []
            };

            A.CallTo(() => authRepository.GetApplicationUser(A<LoginViewModel>.Ignored)).Returns(Task.FromResult<ApplicationUser?>(user));
            A.CallTo(() => authRepository.GetUserRoles(A<ApplicationUser>.Ignored)).Returns(Task.FromResult<IList<string>>([]));
            A.CallTo(() => authRepository.UpdateUser(A<ApplicationUser>.Ignored)).Returns(Task.CompletedTask);
            A.CallTo(() => taskService.GenerateJwtToken(A<ApplicationUser>.Ignored, A<IList<string>?>.Ignored)).Returns("accessToken");
            A.CallTo(() => taskService.GenerateRefreshToken()).Returns(new RefreshToken { Token = "Test"});

            var dto = new LoginViewModel { Email = "ahmedwael2@google.com", Password = "123Ahmed@123" };
            var sut = new AuthService(
                authRepository,
                A.Fake<IOptions<JwtOptions>>(),
                taskService,
                A.Fake<ILogger<AuthService>>(),
                A.Fake<IMemoryCache>()
                );

            //Assert 
            var result = await sut.Login(dto);

            // Act
            Assert.Equal(dto.Email, result.User.Email);
            Assert.Equal("Test", result.RefreshToken);
            Assert.Equal("accessToken", result.AccessToken);
            A.CallTo(() => authRepository.GetApplicationUser(dto)).MustHaveHappenedOnceExactly();
            A.CallTo(() => authRepository.UpdateUser(A<ApplicationUser>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => authRepository.GetUserRoles(A<ApplicationUser>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => taskService.GenerateJwtToken(A<ApplicationUser>.Ignored, A<IList<string>?>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => taskService.GenerateRefreshToken()).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task Login_WhenPasswordAndEmailIsValidAndUserDoesExistAndThereIsActiveRefreshTokens_ShouldUseActiveRefreshTokenAndLoginUser()
        {
            //Arrange
            var authRepository = A.Fake<IAuthRepository>();
            var taskService = A.Fake<ITokenService>();
            var user = new ApplicationUser
            {
                Email = "ahmedwael2@google.com",
                RefreshTokens = [ new RefreshToken { Token = "activeRefreshToken", ExpiresOn = DateTime.UtcNow.AddDays(1)}]
            };

            A.CallTo(() => authRepository.GetApplicationUser(A<LoginViewModel>.Ignored)).Returns(Task.FromResult<ApplicationUser?>(user));
            A.CallTo(() => authRepository.GetUserRoles(A<ApplicationUser>.Ignored)).Returns(Task.FromResult<IList<string>>([]));
            A.CallTo(() => taskService.GenerateJwtToken(A<ApplicationUser>.Ignored, A<IList<string>?>.Ignored)).Returns("accessToken");

            var dto = new LoginViewModel { Email = "ahmedwael2@google.com", Password = "123Ahmed@123" };
            var sut = new AuthService(
                authRepository,
                A.Fake<IOptions<JwtOptions>>(),
                taskService,
                A.Fake<ILogger<AuthService>>(),
                A.Fake<IMemoryCache>()
                );

            //Assert 
            var result = await sut.Login(dto);

            // Act
            Assert.Equal(dto.Email, result.User.Email);
            Assert.Equal("activeRefreshToken", result.RefreshToken);
            Assert.Equal("accessToken", result.AccessToken);
            A.CallTo(() => authRepository.GetApplicationUser(dto)).MustHaveHappenedOnceExactly();
            A.CallTo(() => authRepository.UpdateUser(A<ApplicationUser>.Ignored)).MustNotHaveHappened();
            A.CallTo(() => authRepository.GetUserRoles(A<ApplicationUser>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => taskService.GenerateJwtToken(A<ApplicationUser>.Ignored, A<IList<string>?>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => taskService.GenerateRefreshToken()).MustNotHaveHappened();
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("     ")]
        [InlineData("ahmedwael")]
        [InlineData("ahmedwael@google.comG7!kP2#zL9qR5*vN1xA8mJ4tW6@bY3fH0sU2&pI9oK5^dX1nC7mB4vQ8zL3gJ6hK2jL9sD4fG1hA7sS3dD5fF8gG0hH2jJ4kK6lL9qQ1wW3eE5rR7tT9yY2uU4iI6oO8pP0aA1sS2dD3fF4gG5hH6jJ7kK8lL9zZ0xX1cC2vV3bB4nN5mM6qQ7wW8eE9rR0tT1yY2uU3iI4oO5pP6aA7sS8dD9fF0gG1hH2jJ3kK4lL5zZ6xX7cC8vV9bB0nN1mM2qQ3wW4eE5rR6tT7yY8uU9iI0oOpP1aAsS2dD3f")]
        //Email must be not empty, must be email and have a max length of 256
        //Valid example e.g. ahmedwael2@google.com
        public async Task Register_WhenEmailIsInvalid_ShouldThrowValidationException(string email)
        {
            //Arrange
            var authRepository = A.Fake<IAuthRepository>();
            var dto = new RegisterViewModel { Email = email, Password = "123Ahmed@123", FullName = "Ahmed Wael" };
            var sut = new AuthService(
                authRepository,
                A.Fake<IOptions<JwtOptions>>(),
                A.Fake<ITokenService>(),
                A.Fake<ILogger<AuthService>>(),
                A.Fake<IMemoryCache>()
                );

            //Assert / Act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.Register(dto));
            A.CallTo(() => authRepository.UserExistByEmail(A<string>.Ignored)).MustNotHaveHappened();
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("     ")]
        [InlineData("123")]
        [InlineData("123abc")]
        [InlineData("123Abc")]
        [InlineData("123ab@")]
        [InlineData("U2&pI9oK5^dX1nC7mB4vQ8zL3gJ6hK2jL9sD4fG1hA7sS3dD5fF8gG0hH2jJ4kK6lL9qQ1wW3eE5rR7tT9yY2uU4iI6oO8pP0aA1sS2dD3fF4gG5hH6jJ7kK8lL9zZ0xX1cC2vV3bB4nN5mM6qQ7wW8eE9rR0tT1yY2uU3iI4oO5pP6aA7sS8dD9fF0gG1hH2jJ3kK4lL5zZ6xX7cC8vV9bB0nN1mM2qQ3wW4eE5rR6tT7yY8uU9iI0oOpP1aAsS2dD3f")]
        //Password must not be empty, has a max length of 100, min length of 6 and contains small letter , capital letter, number and symbol
        //Valid example e.g. 123Ahmed@123
        public async Task Register_WhenPasswordIsInvalid_ShouldThrowValidationException(string password)
        {
            //Arrange
            var authRepository = A.Fake<IAuthRepository>();
            var dto = new RegisterViewModel { Email = "ahmedwael2@google.com", Password = password, FullName = "Ahmed Wael" };
            var sut = new AuthService(
                authRepository,
                A.Fake<IOptions<JwtOptions>>(),
                A.Fake<ITokenService>(),
                A.Fake<ILogger<AuthService>>(),
                A.Fake<IMemoryCache>()
                );
            //Assert / Act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.Register(dto));
            A.CallTo(() => authRepository.UserExistByEmail(A<string>.Ignored)).MustNotHaveHappened();
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("    ")]
        [InlineData("belal")]
        [InlineData("belalAhmedLoremTestBEBEbelalAhmedLoremTestBEBEbelalAhmedLoremTestBEBEbelalAhmedLoremTestBEBE")]
        //FullName must not be empty, has min length of 6 and max length of 50
        //Valid example e.g. Ahmed Wael
        public async Task Register_WhenFullNameIsInvalid_ShouldThrowValidationException(string password)
        {
            //Arrange
            var authRepository = A.Fake<IAuthRepository>();
            var dto = new RegisterViewModel { Email = "ahmedwael2@google.com", Password = password, FullName = "Ahmed Wael" };
            var sut = new AuthService(
                authRepository,
                A.Fake<IOptions<JwtOptions>>(),
                A.Fake<ITokenService>(),
                A.Fake<ILogger<AuthService>>(),
                A.Fake<IMemoryCache>()
                );
            //Assert / Act
            await Assert.ThrowsAsync<ValidationException>(async () => await sut.Register(dto));
            A.CallTo(() => authRepository.UserExistByEmail(A<string>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task Register_WhenEmailIsValidAndPasswordIsValidAndFullNameIsValidAndEmailIsTaken_ShouldThrowUserAlreadyExistsValidation()
        {
            //Arrange
            var authRepository = A.Fake<IAuthRepository>();
            var dto = new RegisterViewModel { Email = "ahmedwael2@google.com", Password = "123Ahmed@123", FullName = "Ahmed Wael" };
            A.CallTo(() => authRepository.UserExistByEmail(A<string>.Ignored)).Returns(Task.FromResult(true));
            var sut = new AuthService(
                authRepository,
                A.Fake<IOptions<JwtOptions>>(),
                A.Fake<ITokenService>(),
                A.Fake<ILogger<AuthService>>(),
                A.Fake<IMemoryCache>()
                );

            //Assert / Act
            var e = await Assert.ThrowsAsync<UserAlreadyExistsException>(async () => await sut.Register(dto));
            Assert.Equal("Email is already taken", e.Message);
            A.CallTo(() => authRepository.UserExistByEmail(A<string>.Ignored)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task Register_WhenEmailIsValidAndPasswordIsValidAndFullNameIsValidAndEmailIsNotTakenButCreatingAccountFailed_ShouldThrowException()
        {
            //Arrange
            var authRepository = A.Fake<IAuthRepository>();
            var dto = new RegisterViewModel { Email = "ahmedwael2@google.com", Password = "123Ahmed@123", FullName = "Ahmed Wael" };

            A.CallTo(() => authRepository.UserExistByEmail(A<string>.Ignored)).Returns(Task.FromResult(false));
            A.CallTo(() => authRepository.CreateApplicationUser(A<ApplicationUser>.Ignored, A<string>.Ignored)).Returns(Task.FromResult(Microsoft.AspNetCore.Identity.IdentityResult.Failed()));
            var sut = new AuthService(
                authRepository,
                A.Fake<IOptions<JwtOptions>>(),
                A.Fake<ITokenService>(),
                A.Fake<ILogger<AuthService>>(),
                A.Fake<IMemoryCache>()
                );

            //Assert / Act
            await Assert.ThrowsAsync<Exception>(async () => await sut.Register(dto));
            A.CallTo(() => authRepository.UserExistByEmail(A<string>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => authRepository.CreateApplicationUser(A<ApplicationUser>.Ignored, A<string>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => authRepository.AddDefaultRole(A<ApplicationUser>.Ignored, A<string>.Ignored)).MustNotHaveHappened();
        }

        [Fact]
        public async Task Register_WhenEmailIsValidAndPasswordIsValidAndFullNameIsValidAndEmailIsNotTakenAndAccountCreationSucceded_ShouldRegisterAccount()
        {
            //Arrange
            var authRepository = A.Fake<IAuthRepository>();
            var taskService = A.Fake<ITokenService>();

            A.CallTo(() => authRepository.CreateApplicationUser(A<ApplicationUser>.Ignored, A<string?>.Ignored)).Returns(Task.FromResult(Microsoft.AspNetCore.Identity.IdentityResult.Success));
            A.CallTo(() => authRepository.UserExistByEmail(A<string>.Ignored)).Returns(Task.FromResult(false));
            A.CallTo(() => authRepository.AddDefaultRole(A<ApplicationUser>.Ignored, A<string>.Ignored)).Returns(Task.FromResult(Microsoft.AspNetCore.Identity.IdentityResult.Success));
            A.CallTo(() => authRepository.UpdateUser(A<ApplicationUser>.Ignored)).Returns(Task.CompletedTask);
            A.CallTo(() => taskService.GenerateJwtToken(A<ApplicationUser>.Ignored, A<IList<string>?>.Ignored)).Returns("accessToken");
            A.CallTo(() => taskService.GenerateRefreshToken()).Returns(new RefreshToken { Token = "Test" });

            var dto = new RegisterViewModel
            {
                Email = "ahmedwael2@google.com",
                Password = "123Ahmed@123",
                FullName = "Ahmed Wael"
            };
            var sut = new AuthService(
                authRepository,
                A.Fake<IOptions<JwtOptions>>(),
                taskService,
                A.Fake<ILogger<AuthService>>(),
                A.Fake<IMemoryCache>()
                );

            //Assert 
            var result = await sut.Register(dto);

            // Act
            Assert.Equal(dto.Email, result.User.Email);
            Assert.Equal(dto.FullName, result.User.FullName);
            Assert.Equal("Test", result.RefreshToken);
            Assert.Equal("accessToken", result.AccessToken);
            A.CallTo(() => authRepository.CreateApplicationUser(A<ApplicationUser>.Ignored, A<string?>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => authRepository.UserExistByEmail(A<string>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => authRepository.AddDefaultRole(A<ApplicationUser>.Ignored, A<string>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => authRepository.UpdateUser(A<ApplicationUser>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => taskService.GenerateJwtToken(A<ApplicationUser>.Ignored, A<IList<string>?>.Ignored)).MustHaveHappenedOnceExactly();
            A.CallTo(() => taskService.GenerateRefreshToken()).MustHaveHappenedOnceExactly();
        }
    }
}
