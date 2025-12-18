using MediatR;

namespace DomusVibes.Application.Homes.Commands.CreateHome
{
    public record CreateHomeCommand(
        string Name,
        Guid OwnerUserId
    ) : IRequest<Guid>;
}
