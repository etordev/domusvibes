using DomusVibes.Application.Homes.Commands.CreateHome;
using DomusVibes.Application.Homes.Commands.GenerateInviteCode;
using DomusVibes.Application.Homes.Commands.JoinHome;
using DomusVibes.Application.Homes.Commands.JoinHomeByInviteCode;
using DomusVibes.Application.Homes.Commands.LeaveHome;
using DomusVibes.Application.Homes.Commands.RemoveMember;
using DomusVibes.Application.Homes.Commands.UpdateHome;
using DomusVibes.Application.Homes.Queries.GetHomeDetails;
using DomusVibes.Application.Homes.Queries.GetHomesByUserId;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace DomusVibes.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public HomesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateHomeCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(new { HomeId = id });
        }

        [HttpPost("join")]
        public async Task<IActionResult> Join(JoinHomeCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(new { Joined = result });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(Guid userId)
        {
            var result = await _mediator.Send(new GetHomesByUserIdQuery(userId));
            return Ok(result);
        }

        [HttpGet("{homeId}")]
        public async Task<IActionResult> GetDetails(Guid homeId)
        {
            var result = await _mediator.Send(new GetHomeDetailsQuery(homeId));
            return Ok(result);
        }

        [HttpDelete("leave")]
        public async Task<IActionResult> LeaveHome([FromBody] LeaveHomeCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(new { left = result });
        }

        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveMember([FromBody] RemoveMemberCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(new { removed = result });
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateHome([FromBody] UpdateHomeCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(new { updated = result });
        }

        [HttpPost("invite/generate")]
        public async Task<IActionResult> GenerateInviteCode([FromBody] GenerateInviteCodeCommand command)
        {
            var code = await _mediator.Send(command);
            return Ok(new { inviteCode = code });
        }

        [HttpPost("invite/join")]
        public async Task<IActionResult> JoinByInvite([FromBody] JoinHomeByInviteCodeCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(new { joined = result });
        }

    }
}
