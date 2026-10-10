using MediatR;

namespace DomusVibes.Application.Homes.Commands.UpdateMemberRole
{
    public record UpdateMemberRoleCommand(
        Guid HomeId,
        Guid ExecutorUserId,
        Guid TargetUserId,
        string Role
    ) : IRequest<bool>;
}
