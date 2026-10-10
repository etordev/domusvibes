using DomusVibes.Application.HomePulse;
using MediatR;

namespace DomusVibes.Application.Activities.Commands.RemoveActivity
{
    public record RemoveActivityCommand(
        Guid ActivityId,
        Guid HomeId,
        Guid UserId
    ) : IRequest<HomeChangedDto>;
}
