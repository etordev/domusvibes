using MediatR;
using Microsoft.EntityFrameworkCore;
using DomusVibes.Persistence;

namespace DomusVibes.Application.Notices
{
    public class GetUnreadNoticesHandler : IRequestHandler<GetUnreadNoticesQuery, List<UnreadNoticeDto>>
    {
        private readonly AppDbContext _db;

        public GetUnreadNoticesHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<UnreadNoticeDto>> Handle(GetUnreadNoticesQuery request, CancellationToken cancellationToken)
        {
            var receipts = _db.HomeNoticeReceipts
                .Where(r => r.UserId == request.UserId && r.ReadAt == null)
                .Where(r => r.Notice.Home.Members.Any(m => m.UserId == request.UserId));

            if (request.HomeId is Guid homeId)
                receipts = receipts.Where(r => r.Notice.HomeId == homeId);

            var notices = await receipts
                .OrderByDescending(r => r.Notice.CreatedAt)
                .Take(20)
                .Select(r => new UnreadNoticeDto(
                    r.Notice.Id,
                    r.Notice.HomeId,
                    r.Notice.Home.Name,
                    r.Notice.Message,
                    r.Notice.Alert,
                    r.Notice.CreatedAt))
                .ToListAsync(cancellationToken);

            if (notices.Count == 0)
                return notices;

            var ids = notices.Select(n => n.Id).ToList();
            var pending = await _db.HomeNoticeReceipts
                .Where(r => r.UserId == request.UserId && ids.Contains(r.NoticeId))
                .ToListAsync(cancellationToken);

            var seenAt = DateTimeOffset.UtcNow;
            foreach (var receipt in pending)
                receipt.ReadAt = seenAt;

            await _db.SaveChangesAsync(cancellationToken);
            return notices;
        }
    }
}
