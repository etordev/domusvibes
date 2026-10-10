using MediatR;

namespace DomusVibes.Application.Users.Commands.UpdateUserName
{
    public record UpdateUserNameCommand(Guid UserId, string Name) : IRequest<string>;
}
