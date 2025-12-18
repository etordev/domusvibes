using FluentValidation;

namespace DomusVibes.Application.Homes.Commands.CreateHome
{
    public class CreateHomeValidator : AbstractValidator<CreateHomeCommand>
    {
        public CreateHomeValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MinimumLength(2)
                .MaximumLength(200);

            RuleFor(x => x.OwnerUserId)
                .NotEmpty();
        }
    }
}
