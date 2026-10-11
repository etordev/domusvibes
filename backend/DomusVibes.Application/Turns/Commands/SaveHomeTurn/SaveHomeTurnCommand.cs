using DomusVibes.Application.HomePulse;
using MediatR;

namespace DomusVibes.Application.Turns.Commands.SaveHomeTurn
{
    public record SaveHomeTurnCommand(
        Guid HomeId,
        Guid UserId,
        string TaskKey,
        int IntervalDays,
        int AlertDays,
        DateOnly StartsOn,
        List<Guid> MemberIds
    ) : IRequest<HomeChangedDto>;
}
