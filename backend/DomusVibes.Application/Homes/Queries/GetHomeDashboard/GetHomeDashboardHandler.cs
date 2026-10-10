using DomusVibes.Application.HomePulse;
using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Homes.Queries.GetHomeDashboard
{
    public class GetHomeDashboardHandler : IRequestHandler<GetHomeDashboardQuery, HomeDashboardDto>
    {
        private readonly AppDbContext _db;

        public GetHomeDashboardHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<HomeDashboardDto> Handle(GetHomeDashboardQuery request, CancellationToken cancellationToken)
        {
            var isMember = await _db.HomeMembers.AnyAsync(
                m => m.HomeId == request.HomeId && m.UserId == request.UserId,
                cancellationToken);

            if (!isMember)
                throw new UnauthorizedAccessException("You are not a member of this home.");

            var home = await _db.Homes.FirstOrDefaultAsync(h => h.Id == request.HomeId, cancellationToken);
            if (home == null)
                throw new KeyNotFoundException("Home not found.");

            var today = HomePulseRecorder.Today();

            var pulse = await _db.HomePulses
                .FirstOrDefaultAsync(p => p.HomeId == request.HomeId && p.Day == today, cancellationToken);

            if (pulse == null)
                pulse = await HomePulseRecorder.RecalculateAsync(_db, request.HomeId, cancellationToken);

            var statuses = await _db.DailyStatuses
                .Where(s => s.HomeId == request.HomeId && s.Date == today)
                .ToListAsync(cancellationToken);

            var todayActivities = await _db.ActivityEvents
                .Where(a => a.HomeId == request.HomeId && a.OccurredOn == today)
                .ToListAsync(cancellationToken);

            var members = await _db.HomeMembers
                .Where(m => m.HomeId == request.HomeId)
                .Include(m => m.User)
                .ToListAsync(cancellationToken);

            var monthStart = new DateOnly(today.Year, today.Month, 1);
            if (request.Month is { } chosen)
            {
                var chosenStart = new DateOnly(chosen.Year, chosen.Month, 1);
                if (chosenStart <= monthStart)
                    monthStart = chosenStart;
            }

            var monthEnd = monthStart.AddMonths(1).AddDays(-1);
            var rangeStart = StartOfWeek(monthStart);
            var rangeEnd = StartOfWeek(monthEnd).AddDays(6);
            var history = await _db.HomePulses
                .Where(p => p.HomeId == request.HomeId && p.Day >= rangeStart && p.Day <= rangeEnd)
                .ToListAsync(cancellationToken);

            var mine = statuses.FirstOrDefault(s => s.UserId == request.UserId);
            var anyStatus = statuses.Count > 0;

            return new HomeDashboardDto
            {
                HomeId = home.Id,
                HomeName = home.Name,
                Score = pulse.Score,
                LowMood = pulse.LowMood,
                Alert = pulse.LowMood ? "The house mood is low." : null,
                MoodScore = pulse.MoodScore,
                EnergyScore = pulse.EnergyScore,
                CompletedCount = todayActivities.Count(a => a.Completed),
                MissedCount = todayActivities.Count(a => !a.Completed),
                PositiveNotes = todayActivities.Count(a => !string.IsNullOrWhiteSpace(a.Comment)),
                AverageMood = Word(pulse.MoodScore, anyStatus, "happy", "normal", "stressed"),
                AverageEnergy = Word(pulse.EnergyScore, anyStatus, "high", "medium", "low"),
                MyStatus = mine == null ? null : new MyStatusDto
                {
                    Mood = mine.Mood,
                    Energy = mine.Energy,
                    Availability = mine.Availability
                },
                Members = members.Select(member =>
                {
                    var status = statuses.FirstOrDefault(s => s.UserId == member.UserId);
                    return new MemberStatusDto
                    {
                        UserId = member.UserId,
                        Name = member.User.Name,
                        Role = member.Role,
                        Mood = status?.Mood,
                        Energy = status?.Energy,
                        Availability = status?.Availability
                    };
                }).ToList(),
                RecentActivities = await _db.ActivityEvents
                    .Where(a => a.HomeId == request.HomeId)
                    .OrderByDescending(a => a.OccurredOn)
                    .ThenByDescending(a => a.CreatedAt)
                    .Take(12)
                    .Join(_db.Users, a => a.UserId, u => u.Id, (a, u) => new ActivityItemDto
                    {
                        Id = a.Id,
                        UserName = u.Name,
                        Type = a.Type,
                        Completed = a.Completed,
                        Comment = a.Comment,
                        OccurredOn = a.OccurredOn,
                        CreatedAt = a.CreatedAt
                    })
                    .ToListAsync(cancellationToken),
                History = Points(history, rangeStart, rangeEnd.DayNumber - rangeStart.DayNumber + 1)
            };
        }

        private static string Word(int score, bool any, string high, string mid, string low)
        {
            if (!any)
                return "none";
            if (score >= 80)
                return high;
            if (score <= 40)
                return low;
            return mid;
        }

        private static DateOnly StartOfWeek(DateOnly day)
        {
            var diff = ((int)day.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
            return day.AddDays(-diff);
        }

        private static List<PulsePointDto> Points(
            List<DomusVibes.Domain.Entities.HomePulse> history,
            DateOnly start,
            int days)
        {
            return Enumerable.Range(0, days).Select(offset =>
            {
                var day = start.AddDays(offset);
                var point = history.FirstOrDefault(p => p.Day == day);
                return new PulsePointDto { Day = day, Score = point?.Score };
            }).ToList();
        }
    }
}
