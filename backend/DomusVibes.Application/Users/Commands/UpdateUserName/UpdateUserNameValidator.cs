using FluentValidation;

namespace DomusVibes.Application.Users.Commands.UpdateUserName
{
    public class UpdateUserNameValidator : AbstractValidator<UpdateUserNameCommand>
    {
        public UpdateUserNameValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.Name)
                .NotEmpty()
                .MinimumLength(2)
                .MaximumLength(80);
        }
    }
}
