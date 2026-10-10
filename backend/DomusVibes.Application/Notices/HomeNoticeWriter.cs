using DomusVibes.Application.HomePulse;
using DomusVibes.Domain.Entities;
using DomusVibes.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Application.Notices
{
    public class HomeNoticeWriter
    {
        private readonly AppDbContext _db;

        public HomeNoticeWriter(AppDbContext db)
        {
            _db = db;
        }

        public async Task RecordAsync(HomeChangedDto change, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(change.Message) && string.IsNullOrWhiteSpace(change.Alert))
                return;

            var memberIds = await _db.HomeMembers
                .Where(m => m.HomeId == change.HomeId && m.UserId != change.ActorUserId)
                .Select(m => m.UserId)
                .ToListAsync(cancellationToken);

            if (memberIds.Count == 0)
                return;

            var notice = new HomeNotice
            {
                Id = Guid.NewGuid(),
                HomeId = change.HomeId,
                ActorUserId = change.ActorUserId,
                Message = change.Message ?? "",
                Alert = change.Alert,
                CreatedAt = DateTimeOffset.UtcNow
            };
            _db.HomeNotices.Add(notice);

            foreach (var memberId in memberIds.Distinct())
            {
                _db.HomeNoticeReceipts.Add(new HomeNoticeReceipt
                {
                    NoticeId = notice.Id,
                    UserId = memberId
                });
            }

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
