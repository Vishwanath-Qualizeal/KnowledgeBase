# Use the official .NET runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Use the .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["KernelMemoryAPI.csproj", "./"]
RUN dotnet restore "KernelMemoryAPI.csproj"

# Copy all source code
COPY . .

# Build the application
RUN dotnet build "KernelMemoryAPI.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "KernelMemoryAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage - create the runtime image
FROM base AS final
WORKDIR /app

# Copy the published app
COPY --from=publish /app/publish .

# Set environment variables for production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_HTTP_PORTS=8080
# Unset ASPNETCORE_URLS to avoid override warning - use ASPNETCORE_HTTP_PORTS instead
# ENV ASPNETCORE_URLS=

# Run the application
ENTRYPOINT ["dotnet", "KernelMemoryAPI.dll"]