namespace DomusVibes.Domain.Entities
{
    public class HomeNoticeReceipt
    {
        public Guid NoticeId { get; set; }
        public HomeNotice Notice { get; set; } = default!;
        public Guid UserId { get; set; }
        public DateTimeOffset? ReadAt { get; set; }
    }
}
