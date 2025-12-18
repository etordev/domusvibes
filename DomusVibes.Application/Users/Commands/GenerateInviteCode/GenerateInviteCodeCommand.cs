using MediatR;

namespace DomusVibes.Application.Homes.Commands.GenerateInviteCode
{
    public record GenerateInviteCodeCommand(
        Guid HomeId,
        Guid ExecutorUserId
    ) : IRequest<string>;
}
