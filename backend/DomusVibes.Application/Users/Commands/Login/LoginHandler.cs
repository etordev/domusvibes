using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Users.Commands.Login
{
    public class LoginHandler : IRequestHandler<LoginCommand, LoginResult?>
    {
        private readonly AppDbContext _db;

        public LoginHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<LoginResult?> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return null;

            var user = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == request.Email.Trim(), cancellationToken);

            if (user == null)
                return null;

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return null;

            return new LoginResult(user.Id, user.Name);
        }
    }
}
