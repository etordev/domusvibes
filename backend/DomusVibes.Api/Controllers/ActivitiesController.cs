using DomusVibes.Application.Activities.Commands.LogActivityEvent;
using DomusVibes.Application.Notices;
using DomusVibes.Api.Hubs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DomusVibes.Api.Controllers
{
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
            var result = await _mediator.Send(command, cancellationToken);
            await _notices.RecordAsync(result, cancellationToken);
            await _hub.Clients.Group(result.HomeId.ToString("D")).SendAsync("homeChanged", result, cancellationToken);
            return Ok(result);
        }
    }
}
