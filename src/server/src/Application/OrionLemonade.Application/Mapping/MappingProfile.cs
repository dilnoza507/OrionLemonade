using AutoMapper;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Domain.Entities;

namespace OrionLemonade.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Item mappings
        CreateMap<Item, ItemDto>();
        CreateMap<CreateItemDto, Item>();
        CreateMap<UpdateItemDto, Item>();

        // Branch mappings
        CreateMap<Branch, BranchDto>();
        CreateMap<CreateBranchDto, Branch>();
        CreateMap<UpdateBranchDto, Branch>();

        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

        // UserBranch mappings
        CreateMap<UserBranch, UserBranchDto>();
        CreateMap<CreateUserBranchDto, UserBranch>();
    }
}
