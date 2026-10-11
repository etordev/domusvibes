using DomusVibes.Application.HomePulse;
using DomusVibes.Domain.Entities;
using DomusVibes.Domain.Tasks;
using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Activities.Commands.LogActivityEvent
{
    public class LogActivityEventHandler : IRequestHandler<LogActivityEventCommand, HomeChangedDto>
    {
        private readonly AppDbContext _db;

        public LogActivityEventHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<HomeChangedDto> Handle(LogActivityEventCommand request, CancellationToken cancellationToken)
        {
            var member = await _db.HomeMembers
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.HomeId == request.HomeId && m.UserId == request.UserId, cancellationToken);

            if (member == null)
                throw new UnauthorizedAccessException("You are not a member of this home.");

            var task = HouseholdTasks.Find(request.TaskKey)!;
            var comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim();
            var day = request.OccurredOn ?? HomePulseRecorder.Today();
            _db.ActivityEvents.Add(new ActivityEvent
            {
                Id = Guid.NewGuid(),
                HomeId = request.HomeId,
                UserId = request.UserId,
                Type = task.Group,
                TaskKey = task.Key,
                Weight = request.Weight,
                Completed = request.Completed,
                Comment = comment,
                OccurredOn = day,
                CreatedAt = DateTimeOffset.UtcNow
            });
            await _db.SaveChangesAsync(cancellationToken);

            var pulse = await HomePulseRecorder.RecalculateAsync(_db, request.HomeId, day, cancellationToken);
            var outcome = request.Completed ? "done" : "missed";

            return new HomeChangedDto(
                request.HomeId,
                request.UserId,
                member.User.Name,
                "activity",
                $"activity|{member.User.Name}|{task.Key}|{outcome}|{day:yyyy-MM-dd}",
                pulse.LowMood ? "The house mood is low." : null,
                pulse.Score);
        }
    }
}
