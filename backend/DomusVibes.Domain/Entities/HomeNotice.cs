namespace DomusVibes.Domain.Entities
{
    public class HomeNotice
    {
        public Guid Id { get; set; }
        public Guid HomeId { get; set; }
        public Home Home { get; set; } = default!;
        public Guid ActorUserId { get; set; }
        public string Message { get; set; } = "";
        public string? Alert { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
