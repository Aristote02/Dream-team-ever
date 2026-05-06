# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["Directory.Packages.props", "."]
COPY ["src/backend/Services/DreamTeamEver/DreamTeamEver.Api/DreamTeamEver.Api.csproj", "src/backend/Services/DreamTeamEver/DreamTeamEver.Api/"]
COPY ["src/backend/Services/DreamTeamEver/DreamTeamEver.Application/DreamTeamEver.Application.csproj", "src/backend/Services/DreamTeamEver/DreamTeamEver.Application/"]
COPY ["src/backend/Services/DreamTeamEver/DreamTeamEver.Domain/DreamTeamEver.Domain.csproj", "src/backend/Services/DreamTeamEver/DreamTeamEver.Domain/"]
COPY ["src/backend/Services/DreamTeamEver/DreamTeamEver.Infrastructure/DreamTeamEver.Infrastructure.csproj", "src/backend/Services/DreamTeamEver/DreamTeamEver.Infrastructure/"]
COPY ["src/backend/Aspire/DreamTeamEver.ServiceDefaults/DreamTeamEver.ServiceDefaults.csproj", "src/backend/Aspire/DreamTeamEver.ServiceDefaults/"]

RUN dotnet restore "src/backend/Services/DreamTeamEver/DreamTeamEver.Api/DreamTeamEver.Api.csproj"

COPY . .
WORKDIR "/src/src/backend/Services/DreamTeamEver/DreamTeamEver.Api"
RUN dotnet publish "./DreamTeamEver.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
# Render sets PORT; fallback for local/docker run without PORT.
CMD ["/bin/sh", "-c", "exec dotnet DreamTeamEver.Api.dll --urls \"http://0.0.0.0:${PORT:-8080}\""]
