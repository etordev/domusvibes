using MediatR;

namespace DomusVibes.Application.Homes.Commands.JoinHome
{
    public record JoinHomeCommand(
        Guid UserId,
        Guid HomeId
    ) : IRequest<bool>;
}
