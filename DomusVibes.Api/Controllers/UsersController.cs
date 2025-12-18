using MediatR;
using Microsoft.AspNetCore.Mvc;
using DomusVibes.Application.Users.Commands.CreateUser;

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
    }
}
