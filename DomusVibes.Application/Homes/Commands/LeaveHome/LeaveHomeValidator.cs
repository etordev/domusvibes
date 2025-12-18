using FluentValidation;

namespace DomusVibes.Application.Homes.Commands.LeaveHome
{
    public class LeaveHomeValidator : AbstractValidator<LeaveHomeCommand>
    {
        public LeaveHomeValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.HomeId).NotEmpty();
        }
    }
}
