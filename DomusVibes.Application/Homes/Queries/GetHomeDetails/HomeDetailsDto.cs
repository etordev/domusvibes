namespace DomusVibes.Application.Homes.Queries.GetHomeDetails
{
    public class HomeDetailsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;

        public List<HomeMemberDto> Members { get; set; } = new();
    }
}
