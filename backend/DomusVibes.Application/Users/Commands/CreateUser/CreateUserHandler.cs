using DomusVibes.Domain.Entities;
using DomusVibes.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;

namespace DomusVibes.Application.Users.Commands.CreateUser
{
    public class CreateUserHandler : IRequestHandler<CreateUserCommand, Guid>
    {
        private readonly AppDbContext _db;

        public CreateUserHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            // Check if email already exists
            bool exists = await _db.Users.AnyAsync(u => u.Email == request.Email);
            if (exists)
                throw new Exception("Email is already registered.");

            // Create user
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Name = request.Name,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return user.Id;
        }
    }
}
