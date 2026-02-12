using MediatR;

namespace DomusVibes.Application.Users.Commands.Login
{
    public record LoginCommand(string Email, string Password) : IRequest<LoginResult?>;
}
