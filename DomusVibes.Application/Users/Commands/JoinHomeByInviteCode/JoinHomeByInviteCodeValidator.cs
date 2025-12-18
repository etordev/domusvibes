using FluentValidation;

namespace DomusVibes.Application.Homes.Commands.JoinHomeByInviteCode
{
    public class JoinHomeByInviteCodeValidator : AbstractValidator<JoinHomeByInviteCodeCommand>
    {
        public JoinHomeByInviteCodeValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.InviteCode)
                .NotEmpty()
                .Length(6);
        }
    }
}
