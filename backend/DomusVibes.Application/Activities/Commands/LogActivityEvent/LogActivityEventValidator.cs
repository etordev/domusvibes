using DomusVibes.Domain.Tasks;
using FluentValidation;

namespace DomusVibes.Application.Activities.Commands.LogActivityEvent
{
    public class LogActivityEventValidator : AbstractValidator<LogActivityEventCommand>
    {
        public LogActivityEventValidator()
        {
            RuleFor(x => x.HomeId).NotEmpty();
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.TaskKey).Must(key => HouseholdTasks.Find(key) != null);
            RuleFor(x => x.Weight).InclusiveBetween(1, 5);
            RuleFor(x => x.Comment).MaximumLength(200);
            RuleFor(x => x.OccurredOn)
                .Must(day => day == null || day.Value <= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)))
                .WithMessage("The task date cannot be in the future.");
        }
    }
}
