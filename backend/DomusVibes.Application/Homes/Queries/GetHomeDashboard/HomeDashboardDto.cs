namespace DomusVibes.Application.Homes.Queries.GetHomeDashboard
{
    public class HomeDashboardDto
    {
        public Guid HomeId { get; set; }
        public string HomeName { get; set; } = default!;
        public int Score { get; set; }
        public bool LowMood { get; set; }
        public string? Alert { get; set; }
        public int MoodScore { get; set; }
        public int EnergyScore { get; set; }
        public int CompletedCount { get; set; }
        public int MissedCount { get; set; }
        public int PositiveNotes { get; set; }
        public string AverageMood { get; set; } = "none";
        public string AverageEnergy { get; set; } = "none";
        public MyStatusDto? MyStatus { get; set; }
        public List<MemberStatusDto> Members { get; set; } = new();
        public List<ActivityItemDto> RecentActivities { get; set; } = new();
        public List<PulsePointDto> History { get; set; } = new();
    }

    public class MyStatusDto
    {
        public string Mood { get; set; } = default!;
        public string Energy { get; set; } = default!;
        public string Availability { get; set; } = default!;
    }

    public class MemberStatusDto
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = default!;
        public string Role { get; set; } = default!;
        public string? Mood { get; set; }
        public string? Energy { get; set; }
        public string? Availability { get; set; }
    }

    public class ActivityItemDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = default!;
        public string Type { get; set; } = default!;
        public bool Completed { get; set; }
        public string? Comment { get; set; }
        public DateOnly OccurredOn { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class PulsePointDto
    {
        public DateOnly Day { get; set; }
        public int? Score { get; set; }
    }
}
