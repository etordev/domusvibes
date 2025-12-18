using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Homes.Commands.GenerateInviteCode
{
    public class GenerateInviteCodeHandler
        : IRequestHandler<GenerateInviteCodeCommand, string>
    {
        private readonly AppDbContext _db;

        public GenerateInviteCodeHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<string> Handle(GenerateInviteCodeCommand request, CancellationToken cancellationToken)
        {
            // 1. La casa esiste?
            var home = await _db.Homes.FirstOrDefaultAsync(h => h.Id == request.HomeId, cancellationToken);
            if (home == null)
                throw new Exception("Home not found.");

            // 2. Chi esegue è membro?
            var membership = await _db.HomeMembers.FirstOrDefaultAsync(
                m => m.HomeId == request.HomeId && m.UserId == request.ExecutorUserId,
                cancellationToken);

            if (membership == null)
                throw new Exception("User is not a member of this home.");

            // 3. È owner?
            if (membership.Role != "owner")
                throw new Exception("Only an owner can generate an invite code.");

            // 4. Generazione codice univoco
            string code = GenerateCode();

            // 5. Assegnare al record Home
            home.InviteCode = code;
            _db.Homes.Update(home);

            await _db.SaveChangesAsync(cancellationToken);

            return code;
        }

        private string GenerateCode()
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();

            return new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
