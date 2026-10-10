using DomusVibes.Application.Activities.Commands.LogActivityEvent;
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

        public ActivitiesController(IMediator mediator, IHubContext<HomeHub> hub)
        {
            _mediator = mediator;
            _hub = hub;
        }

        [HttpPost]
        public async Task<IActionResult> Log(LogActivityEventCommand command)
        {
            var result = await _mediator.Send(command);
            await _hub.Clients.Group(result.HomeId.ToString("D")).SendAsync("homeChanged", result);
            return Ok(result);
        }
    }
}
