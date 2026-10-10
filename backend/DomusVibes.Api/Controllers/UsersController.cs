using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DomusVibes.Api.Auth;
using DomusVibes.Application.Users.Commands.CreateUser;
using DomusVibes.Application.Users.Commands.Login;
using DomusVibes.Application.Users.Commands.UpdateUserName;

namespace DVC.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly JwtTokenService _tokens;

        public UsersController(IMediator mediator, JwtTokenService tokens)
        {
            _mediator = mediator;
            _tokens = tokens;
        }

        /// <summary>
        /// Create a new user in the system.
        /// </summary>
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Create(CreateUserCommand command)
        {
            var id = await _mediator.Send(command);
            var name = command.Name.Trim();
            var token = _tokens.Create(id, name, command.Email.Trim());
            return Ok(new { id, name, token });
        }

        /// <summary>
        /// Sign in with email and password. Returns a signed token.
        /// </summary>
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginCommand command)
        {
            var result = await _mediator.Send(command);
            if (result == null)
                return Unauthorized(new { error = "Invalid email or password." });

            var token = _tokens.Create(result.Id, result.Name, command.Email.Trim());
            return Ok(new { id = result.Id, name = result.Name, token });
        }

        [Authorize]
        [HttpPut("name")]
        public async Task<IActionResult> UpdateName(UpdateUserNameCommand command)
        {
            var name = await _mediator.Send(command with { UserId = CurrentUser.Id(User) });
            return Ok(new { name });
        }
    }
}
