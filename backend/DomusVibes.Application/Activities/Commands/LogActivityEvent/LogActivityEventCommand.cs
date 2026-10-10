using DomusVibes.Application.HomePulse;
using MediatR;

namespace DomusVibes.Application.Activities.Commands.LogActivityEvent
{
    public record LogActivityEventCommand(
        Guid HomeId,
        Guid UserId,
        string Type,
        bool Completed,
        string? Comment,
        DateOnly? OccurredOn
    ) : IRequest<HomeChangedDto>;
}
