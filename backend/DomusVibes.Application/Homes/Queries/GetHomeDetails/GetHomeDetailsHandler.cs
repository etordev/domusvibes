using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Homes.Queries.GetHomeDetails
{
    public class GetHomeDetailsHandler
        : IRequestHandler<GetHomeDetailsQuery, HomeDetailsDto>
    {
        private readonly AppDbContext _db;

        public GetHomeDetailsHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<HomeDetailsDto> Handle(GetHomeDetailsQuery request, CancellationToken cancellationToken)
        {
            // Load home + members + user data
            var home = await _db.Homes
                .Where(h => h.Id == request.HomeId)
                .Select(h => new HomeDetailsDto
                {
                    Id = h.Id,
                    Name = h.Name,
                    Members = h.Members
                        .Select(m => new HomeMemberDto
                        {
                            UserId = m.UserId,
                            Name = m.User.Name,
                            Role = m.Role
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (home == null)
                throw new Exception("Home not found.");

            return home;
        }
    }
}
