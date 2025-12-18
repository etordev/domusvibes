using MediatR;

namespace DomusVibes.Application.Homes.Commands.JoinHomeByInviteCode
{
    public record JoinHomeByInviteCodeCommand(
        Guid UserId,
        string InviteCode
    ) : IRequest<bool>;
}
