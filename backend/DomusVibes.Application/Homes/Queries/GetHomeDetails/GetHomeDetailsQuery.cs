using MediatR;

namespace DomusVibes.Application.Homes.Queries.GetHomeDetails
{
    public record GetHomeDetailsQuery(Guid HomeId, Guid UserId)
        : IRequest<HomeDetailsDto>;
}
