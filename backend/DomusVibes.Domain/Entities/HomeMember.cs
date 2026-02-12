namespace DomusVibes.Domain.Entities
{
    public class HomeMember
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = default!;

        public Guid HomeId { get; set; }
        public Home Home { get; set; } = default!;

        // owner or member
        public string Role { get; set; } = "member";
    }
}
