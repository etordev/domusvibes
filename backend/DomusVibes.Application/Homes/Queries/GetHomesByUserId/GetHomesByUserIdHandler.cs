using DomusVibes.Application.HomePulse;
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
            var today = HomePulseRecorder.Today();
            var homes = await _db.HomeMembers
                .Where(hm => hm.UserId == request.UserId)
                .Select(hm => new HomeListItemDto
                {
                    Id = hm.Home.Id,
                    Name = hm.Home.Name,
                    Role = hm.Role,
                    Score = _db.HomePulses
                        .Where(p => p.HomeId == hm.HomeId && p.Day == today)
                        .Select(p => (int?)p.Score)
                        .FirstOrDefault()
                })
                .ToListAsync(cancellationToken);

            return homes;
        }
    }
}
