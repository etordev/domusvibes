using DomusVibes.Api.Auth;
using DomusVibes.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DomusVibes.Api.Hubs
{
    [Authorize]
    public class HomeHub : Hub
    {
        private readonly AppDbContext _db;

        public HomeHub(AppDbContext db)
        {
            _db = db;
        }

        public async Task JoinHome(string homeId)
        {
            if (!Guid.TryParse(homeId, out var id))
                throw new HubException("Invalid home.");

            var userId = CurrentUser.Id(Context.User!);
            var member = await _db.HomeMembers.AnyAsync(m => m.HomeId == id && m.UserId == userId);
            if (!member)
                throw new HubException("You are not a member of this home.");

            await Groups.AddToGroupAsync(Context.ConnectionId, id.ToString("D"));
        }
    }
}
