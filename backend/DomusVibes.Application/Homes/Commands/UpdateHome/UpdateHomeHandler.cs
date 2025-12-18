using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Homes.Commands.UpdateHome
{
    public class UpdateHomeHandler : IRequestHandler<UpdateHomeCommand, bool>
    {
        private readonly AppDbContext _db;

        public UpdateHomeHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<bool> Handle(UpdateHomeCommand request, CancellationToken cancellationToken)
        {
            // 1. Home exists?
            var home = await _db.Homes.FirstOrDefaultAsync(h => h.Id == request.HomeId, cancellationToken);
            if (home == null)
                throw new Exception("Home not found.");

            // 2. Executor is a member?
            var membership = await _db.HomeMembers
                .FirstOrDefaultAsync(m => m.HomeId == request.HomeId && m.UserId == request.ExecutorUserId,
                    cancellationToken);

            if (membership == null)
                throw new Exception("User is not a member of this home.");

            // 3. Executor is owner?
            if (membership.Role != "owner")
                throw new Exception("Only the owner can update this home.");

            // 4. Update data
            home.Name = request.NewName;

            _db.Homes.Update(home);
            await _db.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
