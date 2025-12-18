using MediatR;
using System;
using System.Collections.Generic;

namespace DomusVibes.Application.Homes.Queries.GetHomesByUserId
{
    public record GetHomesByUserIdQuery(Guid UserId)
        : IRequest<List<HomeListItemDto>>;
}
