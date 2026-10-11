using DomusVibes.Application.Activities.Commands.UpdateActivity;
using DomusVibes.Application.HomePulse;
using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Activities.Commands.RemoveActivity
{
    public class RemoveActivityHandler : IRequestHandler<RemoveActivityCommand, HomeChangedDto>
    {
        private readonly AppDbContext _db;

        public RemoveActivityHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<HomeChangedDto> Handle(RemoveActivityCommand request, CancellationToken cancellationToken)
        {
            var member = await _db.HomeMembers
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.HomeId == request.HomeId && m.UserId == request.UserId, cancellationToken);

            if (member == null)
                throw new UnauthorizedAccessException("You are not a member of this home.");

            var activity = await _db.ActivityEvents
                .FirstOrDefaultAsync(a => a.Id == request.ActivityId && a.HomeId == request.HomeId, cancellationToken);

            if (activity == null)
                throw new KeyNotFoundException("Activity not found.");

            if (activity.UserId != request.UserId)
                throw new InvalidOperationException("You can only change an activity you added.");

            var day = activity.OccurredOn;
            var outcome = activity.Completed ? "done" : "missed";
            var type = activity.TaskKey ?? activity.Type;
            _db.ActivityEvents.Remove(activity);
            await _db.SaveChangesAsync(cancellationToken);

            var pulse = await UpdateActivityHandler.RefreshPulse(_db, request.HomeId, day, day, cancellationToken);

            return new HomeChangedDto(
                request.HomeId,
                request.UserId,
                member.User.Name,
                "activity",
                $"activity-removed|{member.User.Name}|{type}|{outcome}|{day:yyyy-MM-dd}",
                pulse.LowMood ? "The house mood is low." : null,
                pulse.Score);
        }
    }
}
