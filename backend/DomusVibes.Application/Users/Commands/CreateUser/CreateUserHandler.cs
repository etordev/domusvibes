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
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new ArgumentException("Email is required.");
            if (string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Password is required.");

            // Check if email already exists
            bool exists = await _db.Users.AnyAsync(u => u.Email == request.Email, cancellationToken);
            if (exists)
                throw new InvalidOperationException("User with provided email already exists.");

            string passwordHash;
            try
            {
                // BCrypt has a 72-byte limit; longer passwords can cause errors
                passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password.Trim());
            }
            catch (Exception ex)
            {
                throw new ArgumentException("Password could not be processed. Please use a different password.", ex);
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email.Trim(),
                Name = (request.Name ?? "").Trim(),
                PasswordHash = passwordHash
            };

            try
            {
                _db.Users.Add(user);
                await _db.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException ex)
            {
                // e.g. unique constraint on email
                throw new InvalidOperationException("User with provided email already exists.", ex);
            }

            return user.Id;
        }
    }
}
