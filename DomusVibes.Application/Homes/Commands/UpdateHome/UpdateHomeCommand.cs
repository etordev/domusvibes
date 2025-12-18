using MediatR;

namespace DomusVibes.Application.Homes.Commands.UpdateHome
{
    public record UpdateHomeCommand(
        Guid HomeId,
        Guid ExecutorUserId,
        string NewName
    ) : IRequest<bool>;
}
