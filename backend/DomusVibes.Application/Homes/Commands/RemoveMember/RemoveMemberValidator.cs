using FluentValidation;

namespace DomusVibes.Application.Homes.Commands.RemoveMember
{
    public class RemoveMemberValidator : AbstractValidator<RemoveMemberCommand>
    {
        public RemoveMemberValidator()
        {
            RuleFor(x => x.HomeId).NotEmpty();
            RuleFor(x => x.ExecutorUserId).NotEmpty();
            RuleFor(x => x.TargetUserId).NotEmpty();
        }
    }
}
