using Microsoft.AspNetCore.SignalR;

namespace DomusVibes.Api.Hubs
{
    public class HomeHub : Hub
    {
        public Task JoinHome(string homeId)
        {
            if (!Guid.TryParse(homeId, out var id))
                throw new HubException("Invalid home.");

            return Groups.AddToGroupAsync(Context.ConnectionId, id.ToString("D"));
        }
    }
}
