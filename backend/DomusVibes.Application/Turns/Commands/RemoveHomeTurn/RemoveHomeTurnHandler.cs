using DomusVibes.Application.HomePulse;
using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Turns.Commands.RemoveHomeTurn
{
    public class RemoveHomeTurnHandler : IRequestHandler<RemoveHomeTurnCommand, HomeChangedDto>
    {
        private readonly AppDbContext _db;

        public RemoveHomeTurnHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<HomeChangedDto> Handle(RemoveHomeTurnCommand request, CancellationToken cancellationToken)
        {
            var actor = await _db.HomeMembers
                .Include(member => member.User)
                .FirstOrDefaultAsync(member => member.HomeId == request.HomeId && member.UserId == request.UserId, cancellationToken);
            if (actor == null)
                throw new UnauthorizedAccessException("You are not a member of this home.");

            var turn = await _db.HomeTurns
                .FirstOrDefaultAsync(item => item.Id == request.TurnId && item.HomeId == request.HomeId, cancellationToken);
            if (turn == null)
                throw new KeyNotFoundException("Turn not found.");

            _db.HomeTurns.Remove(turn);
            await _db.SaveChangesAsync(cancellationToken);
            return new HomeChangedDto(
                request.HomeId,
                request.UserId,
                actor.User.Name,
                "turn",
                "turn-removed",
                null,
                0);
        }
    }
}
