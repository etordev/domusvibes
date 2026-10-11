using DomusVibes.Application.HomePulse;
using MediatR;

namespace DomusVibes.Application.Activities.Commands.UpdateActivity
{
    public record UpdateActivityCommand(
        Guid ActivityId,
        Guid HomeId,
        Guid UserId,
        string Type,
        bool Completed,
        string? Comment,
        DateOnly OccurredOn
    ) : IRequest<HomeChangedDto>;
}
