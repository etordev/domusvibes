using FluentValidation;

namespace DomusVibes.Application.Activities.Commands.UpdateActivity
{
    public class UpdateActivityValidator : AbstractValidator<UpdateActivityCommand>
    {
        private static readonly string[] Types = ["cleaning", "shopping", "kitchen", "trash", "tidying"];

        public UpdateActivityValidator()
        {
            RuleFor(x => x.ActivityId).NotEmpty();
            RuleFor(x => x.HomeId).NotEmpty();
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.Type).Must(type => Types.Contains(type));
            RuleFor(x => x.Comment).MaximumLength(200);
            RuleFor(x => x.OccurredOn)
                .Must(day => day <= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)))
                .WithMessage("The task date cannot be in the future.");
        }
    }
}
