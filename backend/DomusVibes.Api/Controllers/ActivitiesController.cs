using DomusVibes.Application.Activities.Commands.LogActivityEvent;
using DomusVibes.Application.Activities.Commands.RemoveActivity;
using DomusVibes.Application.Activities.Commands.UpdateActivity;
using DomusVibes.Application.Notices;
using DomusVibes.Api.Auth;
using DomusVibes.Api.Hubs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DomusVibes.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/activities")]
    public class ActivitiesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IHubContext<HomeHub> _hub;
        private readonly HomeNoticeWriter _notices;

        public ActivitiesController(IMediator mediator, IHubContext<HomeHub> hub, HomeNoticeWriter notices)
        {
            _mediator = mediator;
            _hub = hub;
            _notices = notices;
        }

        [HttpPost]
        public async Task<IActionResult> Log(LogActivityEventCommand command, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(command with { UserId = CurrentUser.Id(User) }, cancellationToken);
            await _notices.RecordAsync(result, cancellationToken);
            await _hub.Clients.Group(result.HomeId.ToString("D")).SendAsync("homeChanged", result, cancellationToken);
            return Ok(result);
        }

        [HttpPut("{activityId:guid}")]
        public async Task<IActionResult> Update(Guid activityId, UpdateActivityCommand command, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                command with { ActivityId = activityId, UserId = CurrentUser.Id(User) },
                cancellationToken);
            await _notices.RecordAsync(result, cancellationToken);
            await _hub.Clients.Group(result.HomeId.ToString("D")).SendAsync("homeChanged", result, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{activityId:guid}")]
        public async Task<IActionResult> Remove(Guid activityId, [FromQuery] Guid homeId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new RemoveActivityCommand(activityId, homeId, CurrentUser.Id(User)),
                cancellationToken);
            await _notices.RecordAsync(result, cancellationToken);
            await _hub.Clients.Group(result.HomeId.ToString("D")).SendAsync("homeChanged", result, cancellationToken);
            return Ok(result);
        }
    }
}
