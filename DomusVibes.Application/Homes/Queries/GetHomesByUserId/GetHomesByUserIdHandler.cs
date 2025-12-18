using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Homes.Queries.GetHomesByUserId
{
    public class GetHomesByUserIdHandler
        : IRequestHandler<GetHomesByUserIdQuery, List<HomeListItemDto>>
    {
        private readonly AppDbContext _db;

        public GetHomesByUserIdHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<HomeListItemDto>> Handle(GetHomesByUserIdQuery request, CancellationToken cancellationToken)
        {
            var homes = await _db.HomeMembers
                .Where(hm => hm.UserId == request.UserId)
                .Include(hm => hm.Home)
                .Select(hm => new HomeListItemDto
                {
                    Id = hm.Home.Id,
                    Name = hm.Home.Name,
                    Role = hm.Role
                })
                .ToListAsync(cancellationToken);

            return homes;
        }
    }
}
