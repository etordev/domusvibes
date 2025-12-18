namespace DomusVibes.Application.Homes.Queries.GetHomeDetails
{
    public class HomeMemberDto
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = default!;
        public string Role { get; set; } = default!;
    }
}
