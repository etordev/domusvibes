using DomusVibes.Domain.Tasks;
using FluentValidation;

namespace DomusVibes.Application.Activities.Commands.UpdateActivity
{
    public class UpdateActivityValidator : AbstractValidator<UpdateActivityCommand>
    {
        public UpdateActivityValidator()
        {
            RuleFor(x => x.ActivityId).NotEmpty();
            RuleFor(x => x.HomeId).NotEmpty();
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.TaskKey).Must(key => HouseholdTasks.Find(key) != null);
            RuleFor(x => x.Weight).InclusiveBetween(1, 5);
            RuleFor(x => x.Comment).MaximumLength(200);
            RuleFor(x => x.OccurredOn)
                .Must(day => day <= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)))
                .WithMessage("The task date cannot be in the future.");
        }
    }
}
