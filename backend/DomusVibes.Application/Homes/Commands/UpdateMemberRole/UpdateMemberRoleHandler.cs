using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Homes.Commands.UpdateMemberRole
{
    public class UpdateMemberRoleHandler : IRequestHandler<UpdateMemberRoleCommand, bool>
    {
        private readonly AppDbContext _db;

        public UpdateMemberRoleHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<bool> Handle(UpdateMemberRoleCommand request, CancellationToken cancellationToken)
        {
            var homeExists = await _db.Homes.AnyAsync(h => h.Id == request.HomeId, cancellationToken);
            if (!homeExists)
                throw new KeyNotFoundException("Home not found.");

            var executor = await _db.HomeMembers.FirstOrDefaultAsync(
                m => m.HomeId == request.HomeId && m.UserId == request.ExecutorUserId,
                cancellationToken);

            if (executor == null)
                throw new UnauthorizedAccessException("You are not a member of this home.");

            if (executor.Role != "owner")
                throw new UnauthorizedAccessException("Only an owner can change roles.");

            var target = await _db.HomeMembers.FirstOrDefaultAsync(
                m => m.HomeId == request.HomeId && m.UserId == request.TargetUserId,
                cancellationToken);

            if (target == null)
                throw new KeyNotFoundException("That person is not a member of this home.");

            if (target.Role == request.Role)
                return true;

            if (target.Role == "owner" && request.Role == "member")
            {
                var owners = await _db.HomeMembers.CountAsync(
                    m => m.HomeId == request.HomeId && m.Role == "owner",
                    cancellationToken);

                if (owners <= 1)
                    throw new InvalidOperationException("The home must keep at least one owner.");
            }

            target.Role = request.Role;
            await _db.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
