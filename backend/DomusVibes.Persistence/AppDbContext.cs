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
        public DbSet<DailyStatus> DailyStatuses => Set<DailyStatus>();
        public DbSet<ActivityEvent> ActivityEvents => Set<ActivityEvent>();
        public DbSet<HomePulse> HomePulses => Set<HomePulse>();
        public DbSet<HomeNotice> HomeNotices => Set<HomeNotice>();
        public DbSet<HomeNoticeReceipt> HomeNoticeReceipts => Set<HomeNoticeReceipt>();
        public DbSet<HomeTurn> HomeTurns => Set<HomeTurn>();
        public DbSet<HomeTurnMember> HomeTurnMembers => Set<HomeTurnMember>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DailyStatus>()
                .HasIndex(s => new { s.HomeId, s.UserId, s.Date })
                .IsUnique();
            modelBuilder.Entity<DailyStatus>()
                .HasOne<Home>()
                .WithMany()
                .HasForeignKey(s => s.HomeId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<DailyStatus>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ActivityEvent>()
                .HasIndex(a => new { a.HomeId, a.CreatedAt });
            modelBuilder.Entity<ActivityEvent>()
                .HasOne<Home>()
                .WithMany()
                .HasForeignKey(a => a.HomeId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<ActivityEvent>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HomePulse>()
                .HasIndex(p => new { p.HomeId, p.Day })
                .IsUnique();
            modelBuilder.Entity<HomePulse>()
                .HasOne<Home>()
                .WithMany()
                .HasForeignKey(p => p.HomeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HomeNotice>()
                .HasOne(n => n.Home)
                .WithMany()
                .HasForeignKey(n => n.HomeId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<HomeNoticeReceipt>()
                .HasKey(r => new { r.NoticeId, r.UserId });
            modelBuilder.Entity<HomeNoticeReceipt>()
                .HasIndex(r => new { r.UserId, r.ReadAt });
            modelBuilder.Entity<HomeNoticeReceipt>()
                .HasOne(r => r.Notice)
                .WithMany()
                .HasForeignKey(r => r.NoticeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HomeTurn>()
                .HasIndex(t => new { t.HomeId, t.TaskKey })
                .IsUnique();
            modelBuilder.Entity<HomeTurn>()
                .HasOne<Home>()
                .WithMany()
                .HasForeignKey(t => t.HomeId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<HomeTurnMember>()
                .HasKey(m => new { m.TurnId, m.UserId });
            modelBuilder.Entity<HomeTurnMember>()
                .HasOne(m => m.Turn)
                .WithMany(t => t.Members)
                .HasForeignKey(m => m.TurnId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
