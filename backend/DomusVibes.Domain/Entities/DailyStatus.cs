namespace DomusVibes.Domain.Entities
{
    public class DailyStatus
    {
        public Guid Id { get; set; }
        public Guid HomeId { get; set; }
        public Guid UserId { get; set; }
        public DateOnly Date { get; set; }
        public string Mood { get; set; } = default!;
        public string Energy { get; set; } = default!;
        public string Availability { get; set; } = default!;
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
