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
            var isMember = await _db.HomeMembers.AnyAsync(
                m => m.HomeId == request.HomeId && m.UserId == request.UserId,
                cancellationToken);

            if (!isMember)
                throw new UnauthorizedAccessException("You are not a member of this home.");

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
