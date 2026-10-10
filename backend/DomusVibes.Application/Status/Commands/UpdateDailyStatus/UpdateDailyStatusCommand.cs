using DomusVibes.Application.HomePulse;
using MediatR;

namespace DomusVibes.Application.Status.Commands.UpdateDailyStatus
{
    public record UpdateDailyStatusCommand(
        Guid HomeId,
        Guid UserId,
        string Mood,
        string Energy,
        string Availability
    ) : IRequest<HomeChangedDto>;
}
