using FluentValidation;

namespace DomusVibes.Application.Homes.Commands.UpdateHome
{
    public class UpdateHomeValidator : AbstractValidator<UpdateHomeCommand>
    {
        public UpdateHomeValidator()
        {
            RuleFor(x => x.HomeId).NotEmpty();
            RuleFor(x => x.ExecutorUserId).NotEmpty();
            RuleFor(x => x.NewName)
                .NotEmpty()
                .MinimumLength(2)
                .MaximumLength(100);
        }
    }
}
