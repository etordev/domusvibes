using DomusVibes.Domain.Entities;
using DomusVibes.Domain.HomePulse;
using DomusVibes.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.HomePulse
{
    public static class HomePulseRecorder
    {
        public static DateOnly Today() => DateOnly.FromDateTime(DateTime.UtcNow);

        public static async Task<Domain.Entities.HomePulse> RecalculateAsync(
            AppDbContext db,
            Guid homeId,
            CancellationToken cancellationToken)
            => await RecalculateAsync(db, homeId, Today(), cancellationToken);

        public static async Task<Domain.Entities.HomePulse> RecalculateAsync(
            AppDbContext db,
            Guid homeId,
            DateOnly day,
            CancellationToken cancellationToken)
        {
            var statuses = await db.DailyStatuses
                .Where(s => s.HomeId == homeId && s.Date == day)
                .ToListAsync(cancellationToken);

            var activities = await db.ActivityEvents
                .Where(a => a.HomeId == homeId && a.OccurredOn == day)
                .ToListAsync(cancellationToken);

            var result = HomePulseCalculator.Calculate(
                statuses.Select(s => s.Mood).ToList(),
                statuses.Select(s => s.Energy).ToList(),
                activities.Count(a => a.Completed),
                activities.Count(a => !a.Completed),
                activities.Count(a => !string.IsNullOrWhiteSpace(a.Comment)));

            var snapshot = await db.HomePulses
                .FirstOrDefaultAsync(p => p.HomeId == homeId && p.Day == day, cancellationToken);

            if (snapshot == null)
            {
                snapshot = new Domain.Entities.HomePulse
                {
                    Id = Guid.NewGuid(),
                    HomeId = homeId,
                    Day = day
                };
                db.HomePulses.Add(snapshot);
            }

            snapshot.Score = result.Score;
            snapshot.MoodScore = result.MoodScore;
            snapshot.EnergyScore = result.EnergyScore;
            snapshot.CompletedScore = result.CompletedScore;
            snapshot.MissedScore = result.MissedScore;
            snapshot.CommunicationScore = result.CommunicationScore;
            snapshot.LowMood = result.LowMood;
            snapshot.CalculatedAt = DateTimeOffset.UtcNow;

            await db.SaveChangesAsync(cancellationToken);
            return snapshot;
        }
    }
}
