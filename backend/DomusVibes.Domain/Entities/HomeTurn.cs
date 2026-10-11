namespace DomusVibes.Domain.Entities
{
    public class HomeTurn
    {
        public Guid Id { get; set; }
        public Guid HomeId { get; set; }
        public string TaskKey { get; set; } = "";
        public int IntervalDays { get; set; } = 7;
        public int AlertDays { get; set; } = 3;
        public DateOnly StartsOn { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public List<HomeTurnMember> Members { get; set; } = new();
    }

    public class HomeTurnMember
    {
        public Guid TurnId { get; set; }
        public HomeTurn Turn { get; set; } = default!;
        public Guid UserId { get; set; }
        public int SortOrder { get; set; }
    }
}
