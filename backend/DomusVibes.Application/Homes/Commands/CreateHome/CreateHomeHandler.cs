using DomusVibes.Domain.Entities;
using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Homes.Commands.CreateHome
{
    public class CreateHomeHandler : IRequestHandler<CreateHomeCommand, Guid>
    {
        private readonly AppDbContext _db;

        public CreateHomeHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Guid> Handle(CreateHomeCommand request, CancellationToken cancellationToken)
        {
            // Check if user exists
            var userExists = await _db.Users.AnyAsync(u => u.Id == request.OwnerUserId, cancellationToken);
            if (!userExists)
                throw new Exception("Owner user not found.");

            // Create the home
            var home = new Home
            {
                Id = Guid.NewGuid(),
                Name = request.Name
            };

            // Create the HomeMember relationship
            var homeMember = new HomeMember
            {
                HomeId = home.Id,
                UserId = request.OwnerUserId,
                Role = "owner"
            };

            _db.Homes.Add(home);
            _db.HomeMembers.Add(homeMember);

            await _db.SaveChangesAsync(cancellationToken);

            return home.Id;
        }
    }
}
