using Microsoft.Extensions.DependencyInjection;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Application.Mapping;
using OrionLemonade.Application.Services;

namespace OrionLemonade.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));
        services.AddScoped<IItemService, ItemService>();
        services.AddScoped<IBranchService, BranchService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IUserBranchService, UserBranchService>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
