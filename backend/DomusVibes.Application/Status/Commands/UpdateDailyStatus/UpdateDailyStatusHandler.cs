using DomusVibes.Application.HomePulse;
using DomusVibes.Domain.Entities;
using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Status.Commands.UpdateDailyStatus
{
    public class UpdateDailyStatusHandler : IRequestHandler<UpdateDailyStatusCommand, HomeChangedDto>
    {
        private readonly AppDbContext _db;

        public UpdateDailyStatusHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<HomeChangedDto> Handle(UpdateDailyStatusCommand request, CancellationToken cancellationToken)
        {
            var member = await _db.HomeMembers
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.HomeId == request.HomeId && m.UserId == request.UserId, cancellationToken);

            if (member == null)
                throw new UnauthorizedAccessException("You are not a member of this home.");

            var today = HomePulseRecorder.Today();
            var status = await _db.DailyStatuses.FirstOrDefaultAsync(
                s => s.HomeId == request.HomeId && s.UserId == request.UserId && s.Date == today,
                cancellationToken);

            if (status == null)
            {
                status = new DailyStatus
                {
                    Id = Guid.NewGuid(),
                    HomeId = request.HomeId,
                    UserId = request.UserId,
                    Date = today
                };
                _db.DailyStatuses.Add(status);
            }

            status.Mood = request.Mood;
            status.Energy = request.Energy;
            status.Availability = request.Availability;
            status.UpdatedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync(cancellationToken);

            var pulse = await HomePulseRecorder.RecalculateAsync(_db, request.HomeId, cancellationToken);

            return new HomeChangedDto(
                request.HomeId,
                request.UserId,
                member.User.Name,
                "status",
                $"status|{member.User.Name}",
                pulse.LowMood ? "The house mood is low." : null,
                pulse.Score);
        }
    }
}
