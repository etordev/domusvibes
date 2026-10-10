using DomusVibes.Domain.Entities;
using DomusVibes.Domain.HomePulse;
using DomusVibes.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.HomePulse
{
    public static class HomePulseRecorder
    {
        public static DateOnly Today() => DateOnly.FromDateTime(DateTime.UtcNow);

        public static (DateTimeOffset Start, DateTimeOffset End) TodayRange()
        {
            var start = new DateTimeOffset(Today().ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
            return (start, start.AddDays(1));
        }

        public static async Task<Domain.Entities.HomePulse> RecalculateAsync(
            AppDbContext db,
            Guid homeId,
            CancellationToken cancellationToken)
        {
            var today = Today();
            var (start, end) = TodayRange();

            var statuses = await db.DailyStatuses
                .Where(s => s.HomeId == homeId && s.Date == today)
                .ToListAsync(cancellationToken);

            var activities = await db.ActivityEvents
                .Where(a => a.HomeId == homeId && a.CreatedAt >= start && a.CreatedAt < end)
                .ToListAsync(cancellationToken);

            var result = HomePulseCalculator.Calculate(
                statuses.Select(s => s.Mood).ToList(),
                statuses.Select(s => s.Energy).ToList(),
                activities.Count(a => a.Completed),
                activities.Count(a => !a.Completed),
                activities.Count(a => !string.IsNullOrWhiteSpace(a.Comment)));

            var snapshot = await db.HomePulses
                .FirstOrDefaultAsync(p => p.HomeId == homeId && p.Day == today, cancellationToken);

            if (snapshot == null)
            {
                snapshot = new Domain.Entities.HomePulse
                {
                    Id = Guid.NewGuid(),
                    HomeId = homeId,
                    Day = today
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
