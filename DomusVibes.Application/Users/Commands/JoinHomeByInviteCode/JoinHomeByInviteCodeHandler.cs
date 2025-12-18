using DomusVibes.Domain.Entities;
using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Homes.Commands.JoinHomeByInviteCode
{
    public class JoinHomeByInviteCodeHandler
        : IRequestHandler<JoinHomeByInviteCodeCommand, bool>
    {
        private readonly AppDbContext _db;

        public JoinHomeByInviteCodeHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<bool> Handle(JoinHomeByInviteCodeCommand request, CancellationToken cancellationToken)
        {
            // 1. Home exists with code?
            var home = await _db.Homes
                .FirstOrDefaultAsync(h => h.InviteCode == request.InviteCode, cancellationToken);

            if (home == null)
                throw new Exception("Invalid invite code.");

            // 2. Is user member?
            var membership = await _db.HomeMembers
                .FirstOrDefaultAsync(m => m.HomeId == home.Id && m.UserId == request.UserId, cancellationToken);

            if (membership != null)
                throw new Exception("User is already a member of this home.");

            // 3. Add membership
            _db.HomeMembers.Add(new HomeMember
            {
                Id = Guid.NewGuid(),
                HomeId = home.Id,
                UserId = request.UserId,
                Role = "member"
            });

            await _db.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
