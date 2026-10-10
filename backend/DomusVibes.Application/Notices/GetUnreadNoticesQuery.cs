using MediatR;

namespace DomusVibes.Application.Notices
{
    public record UnreadNoticeDto(
        Guid Id,
        Guid HomeId,
        string HomeName,
        string Message,
        string? Alert,
        DateTimeOffset CreatedAt);

    public record GetUnreadNoticesQuery(Guid UserId, Guid? HomeId = null)
        : IRequest<List<UnreadNoticeDto>>;
}
