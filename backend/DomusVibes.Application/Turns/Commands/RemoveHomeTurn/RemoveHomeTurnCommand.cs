using DomusVibes.Application.HomePulse;
using MediatR;

namespace DomusVibes.Application.Turns.Commands.RemoveHomeTurn
{
    public record RemoveHomeTurnCommand(Guid TurnId, Guid HomeId, Guid UserId) : IRequest<HomeChangedDto>;
}
