using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Homes.Commands.LeaveHome
{
    public class LeaveHomeHandler : IRequestHandler<LeaveHomeCommand, bool>
    {
        private readonly AppDbContext _db;

        public LeaveHomeHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<bool> Handle(LeaveHomeCommand request, CancellationToken cancellationToken)
        {
            // 1. Home exists?
            var home = await _db.Homes.FirstOrDefaultAsync(h => h.Id == request.HomeId, cancellationToken);
            if (home == null)
                throw new Exception("Home not found.");

            // 2. Membership exists?
            var membership = await _db.HomeMembers
                .FirstOrDefaultAsync(m => m.HomeId == request.HomeId && m.UserId == request.UserId, cancellationToken);

            if (membership == null)
                throw new Exception("User is not a member of this home.");

            // 3. Prevent last owner from leaving
            if (membership.Role == "owner")
            {
                int ownersCount = await _db.HomeMembers
                    .CountAsync(m => m.HomeId == request.HomeId && m.Role == "owner", cancellationToken);

                if (ownersCount <= 1)
                    throw new Exception("The last owner cannot leave the home.");
            }

            // 4. Remove membership
            _db.HomeMembers.Remove(membership);
            await _db.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
