using MediatR;

namespace DomusVibes.Application.Homes.Queries.GetHomeDashboard
{
    public record GetHomeDashboardQuery(Guid HomeId, Guid UserId) : IRequest<HomeDashboardDto>;
}
