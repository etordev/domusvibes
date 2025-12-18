using MediatR;

namespace DomusVibes.Application.Homes.Commands.RemoveMember
{
    public record RemoveMemberCommand(
        Guid HomeId,
        Guid ExecutorUserId,
        Guid TargetUserId
    ) : IRequest<bool>;
}
