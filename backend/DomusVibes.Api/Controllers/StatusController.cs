using DomusVibes.Application.Status.Commands.UpdateDailyStatus;
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
    [Route("api/status")]
    public class StatusController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IHubContext<HomeHub> _hub;
        private readonly HomeNoticeWriter _notices;

        public StatusController(IMediator mediator, IHubContext<HomeHub> hub, HomeNoticeWriter notices)
        {
            _mediator = mediator;
            _hub = hub;
            _notices = notices;
        }

        [HttpPut("daily")]
        public async Task<IActionResult> UpdateDaily(UpdateDailyStatusCommand command, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(command with { UserId = CurrentUser.Id(User) }, cancellationToken);
            await _notices.RecordAsync(result, cancellationToken);
            await _hub.Clients.Group(result.HomeId.ToString("D")).SendAsync("homeChanged", result, cancellationToken);
            return Ok(result);
        }
    }
}
