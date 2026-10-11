using DomusVibes.Application.HomePulse;
using DomusVibes.Domain.Tasks;
using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Activities.Commands.UpdateActivity
{
    public class UpdateActivityHandler : IRequestHandler<UpdateActivityCommand, HomeChangedDto>
    {
        private readonly AppDbContext _db;

        public UpdateActivityHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<HomeChangedDto> Handle(UpdateActivityCommand request, CancellationToken cancellationToken)
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

            var task = HouseholdTasks.Find(request.TaskKey)!;
            var previousDay = activity.OccurredOn;
            activity.Type = task.Group;
            activity.TaskKey = task.Key;
            activity.Weight = request.Weight;
            activity.Completed = request.Completed;
            activity.Comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim();
            activity.OccurredOn = request.OccurredOn;
            await _db.SaveChangesAsync(cancellationToken);

            var pulse = await RefreshPulse(_db, request.HomeId, previousDay, request.OccurredOn, cancellationToken);
            var outcome = request.Completed ? "done" : "missed";

            return new HomeChangedDto(
                request.HomeId,
                request.UserId,
                member.User.Name,
                "activity",
                $"activity-updated|{member.User.Name}|{task.Key}|{outcome}|{request.OccurredOn:yyyy-MM-dd}",
                pulse.LowMood ? "The house mood is low." : null,
                pulse.Score);
        }

        internal static async Task<Domain.Entities.HomePulse> RefreshPulse(
            AppDbContext db,
            Guid homeId,
            DateOnly previousDay,
            DateOnly nextDay,
            CancellationToken cancellationToken)
        {
            var today = HomePulseRecorder.Today();
            Domain.Entities.HomePulse? current = null;
            foreach (var day in new[] { previousDay, nextDay, today }.Distinct())
            {
                var pulse = await HomePulseRecorder.RecalculateAsync(db, homeId, day, cancellationToken);
                if (day == today)
                    current = pulse;
            }

            return current!;
        }
    }
}
