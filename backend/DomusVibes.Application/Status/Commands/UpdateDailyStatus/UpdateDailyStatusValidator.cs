using FluentValidation;

namespace DomusVibes.Application.Status.Commands.UpdateDailyStatus
{
    public class UpdateDailyStatusValidator : AbstractValidator<UpdateDailyStatusCommand>
    {
        public UpdateDailyStatusValidator()
        {
            RuleFor(x => x.HomeId).NotEmpty();
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.Mood).Must(mood => mood is "happy" or "normal" or "stressed");
            RuleFor(x => x.Energy).Must(energy => energy is "high" or "medium" or "low");
            RuleFor(x => x.Availability).Must(value => value is "available" or "limited" or "unavailable");
        }
    }
}
