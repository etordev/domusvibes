using DomusVibes.Application.HomePulse;
using DomusVibes.Domain.Entities;
using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Turns.Commands.SaveHomeTurn
{
    public class SaveHomeTurnHandler : IRequestHandler<SaveHomeTurnCommand, HomeChangedDto>
    {
        private readonly AppDbContext _db;

        public SaveHomeTurnHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<HomeChangedDto> Handle(SaveHomeTurnCommand request, CancellationToken cancellationToken)
        {
            var actor = await _db.HomeMembers
                .Include(member => member.User)
                .FirstOrDefaultAsync(member => member.HomeId == request.HomeId && member.UserId == request.UserId, cancellationToken);
            if (actor == null)
                throw new UnauthorizedAccessException("You are not a member of this home.");

            var homeMemberIds = await _db.HomeMembers
                .Where(member => member.HomeId == request.HomeId)
                .Select(member => member.UserId)
                .ToListAsync(cancellationToken);
            var chosen = request.MemberIds.Where(homeMemberIds.Contains).Distinct().ToList();
            if (chosen.Count == 0)
                throw new InvalidOperationException("Choose at least one person who lives here.");

            var existing = await _db.HomeTurns
                .Include(turn => turn.Members)
                .FirstOrDefaultAsync(turn => turn.HomeId == request.HomeId && turn.TaskKey == request.TaskKey, cancellationToken);
            if (existing != null)
            {
                _db.HomeTurnMembers.RemoveRange(existing.Members);
                existing.IntervalDays = request.IntervalDays;
                existing.AlertDays = request.AlertDays;
                existing.StartsOn = request.StartsOn;
                var order = 0;
                foreach (var id in chosen)
                {
                    existing.Members.Add(new HomeTurnMember
                    {
                        TurnId = existing.Id,
                        UserId = id,
                        SortOrder = order++
                    });
                }
            }
            else
            {
                _db.HomeTurns.Add(new HomeTurn
                {
                    Id = Guid.NewGuid(),
                    HomeId = request.HomeId,
                    TaskKey = request.TaskKey,
                    IntervalDays = request.IntervalDays,
                    AlertDays = request.AlertDays,
                    StartsOn = request.StartsOn,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Members = chosen.Select((id, index) => new HomeTurnMember
                    {
                        UserId = id,
                        SortOrder = index
                    }).ToList()
                });
            }

            await _db.SaveChangesAsync(cancellationToken);
            return new HomeChangedDto(
                request.HomeId,
                request.UserId,
                actor.User.Name,
                "turn",
                $"turn-saved|{request.TaskKey}",
                null,
                0);
        }
    }
}
