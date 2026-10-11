using DomusVibes.Domain.Tasks;
using FluentValidation;

namespace DomusVibes.Application.Turns.Commands.SaveHomeTurn
{
    public class SaveHomeTurnValidator : AbstractValidator<SaveHomeTurnCommand>
    {
        public SaveHomeTurnValidator()
        {
            RuleFor(x => x.HomeId).NotEmpty();
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.TaskKey).Must(key => HouseholdTasks.Find(key) != null);
            RuleFor(x => x.IntervalDays).InclusiveBetween(1, 90);
            RuleFor(x => x.AlertDays).InclusiveBetween(0, 30);
            RuleFor(x => x.MemberIds).NotEmpty();
        }
    }
}
