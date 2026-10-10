using FluentValidation;

namespace DomusVibes.Application.Activities.Commands.LogActivityEvent
{
    public class LogActivityEventValidator : AbstractValidator<LogActivityEventCommand>
    {
        private static readonly string[] Types = ["cleaning", "shopping", "kitchen", "trash", "tidying"];

        public LogActivityEventValidator()
        {
            RuleFor(x => x.HomeId).NotEmpty();
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.Type).Must(type => Types.Contains(type));
            RuleFor(x => x.Comment).MaximumLength(200);
            RuleFor(x => x.OccurredOn)
                .Must(day => day == null || day.Value <= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)))
                .WithMessage("The task date cannot be in the future.");
        }
    }
}
