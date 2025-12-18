using MediatR;

namespace DomusVibes.Application.Homes.Commands.LeaveHome
{
    public record LeaveHomeCommand(
        Guid UserId,
        Guid HomeId
    ) : IRequest<bool>;
}
