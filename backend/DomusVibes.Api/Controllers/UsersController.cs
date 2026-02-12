using MediatR;
using Microsoft.AspNetCore.Mvc;
using DomusVibes.Application.Users.Commands.CreateUser;
using DomusVibes.Application.Users.Commands.Login;

namespace DVC.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Create a new user in the system.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create(CreateUserCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(new { Id = id });
        }

        /// <summary>
        /// Sign in with email and password. Returns user id and name if valid.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginCommand command)
        {
            var result = await _mediator.Send(command);
            if (result == null)
                return Unauthorized(new { error = "Invalid email or password." });
            return Ok(new { id = result.Id, name = result.Name });
        }
    }
}
