using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Users.Commands.UpdateUserName
{
    public class UpdateUserNameHandler : IRequestHandler<UpdateUserNameCommand, string>
    {
        private readonly AppDbContext _db;

        public UpdateUserNameHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<string> Handle(UpdateUserNameCommand request, CancellationToken cancellationToken)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
            if (user == null)
                throw new KeyNotFoundException("User not found.");

            user.Name = request.Name.Trim();
            await _db.SaveChangesAsync(cancellationToken);
            return user.Name;
        }
    }
}
