FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/DomusVibes.Domain/DomusVibes.Domain.csproj backend/DomusVibes.Domain/
COPY backend/DomusVibes.Persistence/DomusVibes.Persistence.csproj backend/DomusVibes.Persistence/
COPY backend/DomusVibes.Application/DomusVibes.Application.csproj backend/DomusVibes.Application/
COPY backend/DomusVibes.Api/DomusVibes.Api.csproj backend/DomusVibes.Api/
RUN dotnet restore backend/DomusVibes.Api/DomusVibes.Api.csproj

COPY backend/ backend/
RUN dotnet publish backend/DomusVibes.Api/DomusVibes.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 10000
ENTRYPOINT ["dotnet", "DomusVibes.Api.dll"]
