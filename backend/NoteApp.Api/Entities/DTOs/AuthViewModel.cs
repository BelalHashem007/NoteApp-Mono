using FluentValidation;
using System.ComponentModel.DataAnnotations;

namespace NoteApp.Api.Entities.DTOs
{
    public class AuthViewModel
    {
        public bool Success { get; set; }
        public string? AccessToken { get; set; }
    }

    public class LoginViewModel
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class LoginViewModelValidator : AbstractValidator<LoginViewModel>
    {
        public LoginViewModelValidator()
        {
            RuleFor(loginModel => loginModel.Email)
                .NotEmpty()
                .EmailAddress()
                .MaximumLength(256);

            RuleFor(loginModel => loginModel.Password)
                .NotEmpty()
                .MinimumLength(6)
                .MaximumLength(100)
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one digit")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character");
        }
    }

    public class RegisterViewModel
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterViewModelValidator : AbstractValidator<RegisterViewModel>
    {
        public RegisterViewModelValidator()
        {
            RuleFor(registerModel => registerModel.Email)
                .NotEmpty()
                .EmailAddress()
                .MaximumLength(256);

            RuleFor(registerModel => registerModel.Password)
                .NotEmpty()
                .MinimumLength(6)
                .MaximumLength(100)
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one digit")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character");

            RuleFor(registerModel => registerModel.FullName)
                .NotEmpty()
                .MinimumLength(6)
                .MaximumLength(50);
        }
    }
}
