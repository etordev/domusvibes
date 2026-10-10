namespace DomusVibes.Application.HomePulse
{
    public record HomeChangedDto(
        Guid HomeId,
        Guid ActorUserId,
        string ActorName,
        string Kind,
        string Message,
        string? Alert,
        int Score);
}
