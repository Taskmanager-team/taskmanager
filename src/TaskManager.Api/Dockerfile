# ---- Stage 1 : build ----
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copie uniquement les .csproj d'abord (optimisation du cache Docker)
COPY ["src/TaskManager.Api/TaskManager.Api.csproj", "src/TaskManager.Api/"]
COPY ["src/TaskManager.Application/TaskManager.Application.csproj", "src/TaskManager.Application/"]
COPY ["src/TaskManager.Domain/TaskManager.Domain.csproj", "src/TaskManager.Domain/"]
COPY ["src/TaskManager.Infrastructure/TaskManager.Infrastructure.csproj", "src/TaskManager.Infrastructure/"]

RUN dotnet restore "src/TaskManager.Api/TaskManager.Api.csproj"

# Copie tout le reste du code source
COPY src/ src/

# Build et publish
WORKDIR /src/src/TaskManager.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

# ---- Stage 2 : runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Utilisateur non-root
RUN adduser --disabled-password --gecos "" appuser
USER appuser

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "TaskManager.Api.dll"]