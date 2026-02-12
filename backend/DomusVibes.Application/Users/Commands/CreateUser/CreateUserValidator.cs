using System.Linq;
using FluentValidation;

namespace DomusVibes.Application.Users.Commands.CreateUser
{
    public class CreateUserValidator : AbstractValidator<CreateUserCommand>
    {
        public CreateUserValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Name)
                .NotEmpty()
                .MinimumLength(2);

            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(6)
                .Must(BeAStrongPassword)
                .WithMessage("Password requires a minimum of 6 characters with at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        }

        private static bool BeAStrongPassword(string? password)
        {
            if (string.IsNullOrEmpty(password) || password.Length < 6)
                return false;
            bool hasUpper = password.Any(char.IsUpper);
            bool hasLower = password.Any(char.IsLower);
            bool hasDigit = password.Any(char.IsDigit);
            bool hasSpecial = password.Any(c => !char.IsLetterOrDigit(c));
            return hasUpper && hasLower && hasDigit && hasSpecial;
        }
    }
}
