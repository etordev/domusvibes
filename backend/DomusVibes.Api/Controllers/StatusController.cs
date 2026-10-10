using DomusVibes.Application.Status.Commands.UpdateDailyStatus;
using DomusVibes.Api.Hubs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DomusVibes.Api.Controllers
{
    [ApiController]
    [Route("api/status")]
    public class StatusController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IHubContext<HomeHub> _hub;

        public StatusController(IMediator mediator, IHubContext<HomeHub> hub)
        {
            _mediator = mediator;
            _hub = hub;
        }

        [HttpPut("daily")]
        public async Task<IActionResult> UpdateDaily(UpdateDailyStatusCommand command)
        {
            var result = await _mediator.Send(command);
            await _hub.Clients.Group(result.HomeId.ToString("D")).SendAsync("homeChanged", result);
            return Ok(result);
        }
    }
}
