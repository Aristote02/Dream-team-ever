# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/DreamTeamEver.Api/DreamTeamEver.Api.csproj", "src/DreamTeamEver.Api/"]
COPY ["src/DreamTeamEver.Application/DreamTeamEver.Application.csproj", "src/DreamTeamEver.Application/"]
COPY ["src/DreamTeamEver.Domain/DreamTeamEver.Domain.csproj", "src/DreamTeamEver.Domain/"]
COPY ["src/DreamTeamEver.Infrastructure/DreamTeamEver.Infrastructure.csproj", "src/DreamTeamEver.Infrastructure/"]
COPY ["src/DreamTeamEver.ServiceDefaults/DreamTeamEver.ServiceDefaults.csproj", "src/DreamTeamEver.ServiceDefaults/"]
RUN dotnet restore "src/DreamTeamEver.Api/DreamTeamEver.Api.csproj"
COPY . .
WORKDIR "/src/src/DreamTeamEver.Api"
RUN dotnet build "./DreamTeamEver.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./DreamTeamEver.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DreamTeamEver.Api.dll"]
