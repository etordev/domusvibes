using DomusVibes.Domain.Entities;
using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Homes.Commands.JoinHome
{
    public class JoinHomeHandler : IRequestHandler<JoinHomeCommand, bool>
    {
        private readonly AppDbContext _db;

        public JoinHomeHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<bool> Handle(JoinHomeCommand request, CancellationToken cancellationToken)
        {
            // 1. Check user exists
            var userExists = await _db.Users.AnyAsync(u => u.Id == request.UserId, cancellationToken);
            if (!userExists)
                throw new Exception("User not found.");

            // 2. Check home exists
            var homeExists = await _db.Homes.AnyAsync(h => h.Id == request.HomeId, cancellationToken);
            if (!homeExists)
                throw new Exception("Home not found.");

            // 3. Check if already a member
            var alreadyMember = await _db.HomeMembers
                .AnyAsync(hm => hm.HomeId == request.HomeId && hm.UserId == request.UserId, cancellationToken);

            if (alreadyMember)
                throw new Exception("User is already a member of this home.");

            // 4. Add membership
            var membership = new HomeMember
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                HomeId = request.HomeId,
                Role = "member"
            };

            _db.HomeMembers.Add(membership);
            await _db.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
