using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Helpers;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class UserService(IUnitOfWork unitOfWork, IAuthRepository authRepository) : IUserService
    {
        public async Task<ApplicationUserViewModel> GetUser(string userId, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ValidationException("No userid is given!");

            var user = await unitOfWork.Users.GetById(userId, ct) ?? throw new NotFoundException("User does not exist");
            var roles = await authRepository.GetUserRoles(user);

            var userViewModel = ObjectMapperHelper.Map<ApplicationUser, ApplicationUserViewModel>(user);
            userViewModel.Roles = roles;
            return userViewModel;
        }
    }
}
