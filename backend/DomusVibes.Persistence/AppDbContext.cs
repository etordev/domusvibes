using Microsoft.EntityFrameworkCore;
using DomusVibes.Domain.Entities;

namespace DomusVibes.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Home> Homes => Set<Home>();
        public DbSet<HomeMember> HomeMembers => Set<HomeMember>();
    }
}
