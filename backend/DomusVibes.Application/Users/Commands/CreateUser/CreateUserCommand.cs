using MediatR;

namespace DomusVibes.Application.Users.Commands.CreateUser
{
    public record CreateUserCommand(
        string Email,
        string Name,
        string Password
    ) : IRequest<Guid>;
}
