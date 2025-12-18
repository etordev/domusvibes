using FluentValidation;

namespace DomusVibes.Application.Homes.Commands.GenerateInviteCode
{
    public class GenerateInviteCodeValidator : AbstractValidator<GenerateInviteCodeCommand>
    {
        public GenerateInviteCodeValidator()
        {
            RuleFor(x => x.HomeId).NotEmpty();
            RuleFor(x => x.ExecutorUserId).NotEmpty();
        }
    }
}
