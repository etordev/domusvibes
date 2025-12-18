namespace DomusVibes.Application.Homes.Queries.GetHomesByUserId
{
    public class HomeListItemDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Role { get; set; } = default!;
    }
}
