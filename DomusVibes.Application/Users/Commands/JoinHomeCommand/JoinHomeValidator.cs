using FluentValidation;

namespace DomusVibes.Application.Homes.Commands.JoinHome
{
    public class JoinHomeValidator : AbstractValidator<JoinHomeCommand>
    {
        public JoinHomeValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.HomeId).NotEmpty();
        }
    }
}
