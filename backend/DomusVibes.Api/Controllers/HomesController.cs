using DomusVibes.Application.Homes.Commands.CreateHome;
using DomusVibes.Application.Homes.Commands.GenerateInviteCode;
using DomusVibes.Application.Homes.Commands.JoinHome;
using DomusVibes.Application.Homes.Commands.JoinHomeByInviteCode;
using DomusVibes.Application.Homes.Commands.LeaveHome;
using DomusVibes.Application.Homes.Commands.RemoveMember;
using DomusVibes.Application.HomePulse;
using DomusVibes.Application.Homes.Commands.UpdateHome;
using DomusVibes.Application.Homes.Commands.UpdateMemberRole;
using DomusVibes.Application.Homes.Queries.GetHomeDashboard;
using DomusVibes.Api.Auth;
using DomusVibes.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using DomusVibes.Application.Homes.Queries.GetHomeDetails;
using DomusVibes.Application.Homes.Queries.GetHomesByUserId;
using DomusVibes.Application.Notices;
using DomusVibes.Application.Turns.Commands.RemoveHomeTurn;
using DomusVibes.Application.Turns.Commands.SaveHomeTurn;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DomusVibes.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class HomesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IHubContext<HomeHub> _hub;
        private readonly HomeNoticeWriter _notices;

        public HomesController(IMediator mediator, IHubContext<HomeHub> hub, HomeNoticeWriter notices)
        {
            _mediator = mediator;
            _hub = hub;
            _notices = notices;
        }

        [HttpGet("notices")]
        public async Task<IActionResult> Notices([FromQuery] Guid? homeId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetUnreadNoticesQuery(CurrentUser.Id(User), homeId), cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateHomeCommand command)
        {
            var id = await _mediator.Send(command with { OwnerUserId = CurrentUser.Id(User) });
            return Ok(new { HomeId = id });
        }

        [HttpPost("join")]
        public async Task<IActionResult> Join(JoinHomeCommand command)
        {
            var result = await _mediator.Send(command with { UserId = CurrentUser.Id(User) });
            return Ok(new { Joined = result });
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMine()
        {
            var result = await _mediator.Send(new GetHomesByUserIdQuery(CurrentUser.Id(User)));
            return Ok(result);
        }

        [HttpGet("{homeId}/dashboard")]
        public async Task<IActionResult> GetDashboard(Guid homeId, [FromQuery] DateOnly? month)
        {
            var result = await _mediator.Send(new GetHomeDashboardQuery(homeId, CurrentUser.Id(User), month));
            return Ok(result);
        }

        [HttpGet("{homeId}")]
        public async Task<IActionResult> GetDetails(Guid homeId)
        {
            var result = await _mediator.Send(new GetHomeDetailsQuery(homeId, CurrentUser.Id(User)));
            return Ok(result);
        }

        [HttpDelete("leave")]
        public async Task<IActionResult> LeaveHome([FromBody] LeaveHomeCommand command)
        {
            var result = await _mediator.Send(command with { UserId = CurrentUser.Id(User) });
            return Ok(new { left = result });
        }

        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveMember([FromBody] RemoveMemberCommand command)
        {
            var actor = CurrentUser.Id(User);
            command = command with { ExecutorUserId = actor };
            var result = await _mediator.Send(command);
            await Notify(command.HomeId, actor, "A tenant was removed from the home.");
            return Ok(new { removed = result });
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateHome([FromBody] UpdateHomeCommand command)
        {
            var actor = CurrentUser.Id(User);
            command = command with { ExecutorUserId = actor };
            var result = await _mediator.Send(command);
            await Notify(command.HomeId, actor, "The home name was updated.");
            return Ok(new { updated = result });
        }

        [HttpPut("role")]
        public async Task<IActionResult> UpdateMemberRole([FromBody] UpdateMemberRoleCommand command)
        {
            var actor = CurrentUser.Id(User);
            command = command with { ExecutorUserId = actor };
            var result = await _mediator.Send(command);
            await Notify(command.HomeId, actor, "A tenant's role was updated.");
            return Ok(new { updated = result });
        }

        private async Task Notify(Guid homeId, Guid actorUserId, string message)
        {
            var change = new HomeChangedDto(homeId, actorUserId, "", "settings", message, null, 0);
            await _notices.RecordAsync(change);
            await _hub.Clients.Group(homeId.ToString("D")).SendAsync("homeChanged", change);
        }

        [HttpPost("invite/generate")]
        public async Task<IActionResult> GenerateInviteCode([FromBody] GenerateInviteCodeCommand command)
        {
            var code = await _mediator.Send(command with { ExecutorUserId = CurrentUser.Id(User) });
            return Ok(new { inviteCode = code });
        }

        [HttpPost("{homeId:guid}/turns")]
        public async Task<IActionResult> SaveTurn(Guid homeId, [FromBody] SaveHomeTurnCommand command, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(command with { HomeId = homeId, UserId = CurrentUser.Id(User) }, cancellationToken);
            await _hub.Clients.Group(homeId.ToString("D")).SendAsync("homeChanged", result, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{homeId:guid}/turns/{turnId:guid}")]
        public async Task<IActionResult> RemoveTurn(Guid homeId, Guid turnId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new RemoveHomeTurnCommand(turnId, homeId, CurrentUser.Id(User)), cancellationToken);
            await _hub.Clients.Group(homeId.ToString("D")).SendAsync("homeChanged", result, cancellationToken);
            return Ok(result);
        }

        [HttpPost("invite/join")]
        public async Task<IActionResult> JoinByInvite([FromBody] JoinHomeByInviteCodeCommand command)
        {
            var result = await _mediator.Send(command with { UserId = CurrentUser.Id(User) });
            return Ok(new { joined = result });
        }

    }
}
