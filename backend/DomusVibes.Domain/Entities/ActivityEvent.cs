namespace DomusVibes.Domain.Entities
{
    public class ActivityEvent
    {
        public Guid Id { get; set; }
        public Guid HomeId { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; } = default!;
        public string? TaskKey { get; set; }
        public int Weight { get; set; } = 1;
        public bool Completed { get; set; }
        public string? Comment { get; set; }
        public DateOnly OccurredOn { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
