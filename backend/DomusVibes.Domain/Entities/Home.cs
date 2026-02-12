namespace DomusVibes.Domain.Entities
{
    public class Home
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string? InviteCode { get; set; }

        // Navigation: list of home members
        public List<HomeMember> Members { get; set; } = new List<HomeMember>();
    }
}
