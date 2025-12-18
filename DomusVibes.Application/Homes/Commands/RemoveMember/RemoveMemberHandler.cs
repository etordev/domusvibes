using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Homes.Commands.RemoveMember
{
    public class RemoveMemberHandler : IRequestHandler<RemoveMemberCommand, bool>
    {
        private readonly AppDbContext _db;

        public RemoveMemberHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<bool> Handle(RemoveMemberCommand request, CancellationToken cancellationToken)
        {
            // 1. Home exists?
            var home = await _db.Homes
                .FirstOrDefaultAsync(h => h.Id == request.HomeId, cancellationToken);

            if (home == null)
                throw new Exception("Home not found.");

            // 2. Executor is a member?
            var executorMembership = await _db.HomeMembers
                .FirstOrDefaultAsync(m =>
                    m.HomeId == request.HomeId &&
                    m.UserId == request.ExecutorUserId,
                    cancellationToken);

            if (executorMembership == null)
                throw new Exception("Executor is not a member of this home.");

            // 3. Executor is owner?
            if (executorMembership.Role != "owner")
                throw new Exception("Only an owner can remove members.");

            // 4. Target is a member?
            var targetMembership = await _db.HomeMembers
                .FirstOrDefaultAsync(m =>
                    m.HomeId == request.HomeId &&
                    m.UserId == request.TargetUserId,
                    cancellationToken);

            if (targetMembership == null)
                throw new Exception("Target user is not a member of this home.");

            // 5. Prevent removing another owner
            if (targetMembership.Role == "owner")
                throw new Exception("You cannot remove another owner.");

            // 6. Prevent removing yourself (use LeaveHome instead)
            if (request.ExecutorUserId == request.TargetUserId)
                throw new Exception("Use LeaveHome to remove yourself.");

            // 7. Remove membership
            _db.HomeMembers.Remove(targetMembership);
            await _db.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
