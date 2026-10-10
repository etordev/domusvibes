using FluentValidation;

namespace DomusVibes.Application.Homes.Commands.UpdateMemberRole
{
    public class UpdateMemberRoleValidator : AbstractValidator<UpdateMemberRoleCommand>
    {
        public UpdateMemberRoleValidator()
        {
            RuleFor(x => x.HomeId).NotEmpty();
            RuleFor(x => x.ExecutorUserId).NotEmpty();
            RuleFor(x => x.TargetUserId).NotEmpty();
            RuleFor(x => x.Role).Must(role => role is "owner" or "member");
        }
    }
}
