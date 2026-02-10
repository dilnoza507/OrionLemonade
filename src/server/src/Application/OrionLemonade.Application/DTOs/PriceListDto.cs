using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class PriceListDto
{
    public int Id { get; set; }
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PriceListType ListType { get; set; }
    public string ListTypeName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class PriceListDetailDto
{
    public int Id { get; set; }
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PriceListType ListType { get; set; }
    public string ListTypeName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<PriceListItemDto> Items { get; set; } = new();
}

public class PriceListItemDto
{
    public int Id { get; set; }
    public int PriceListId { get; set; }
    public int RecipeId { get; set; }
    public string RecipeName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal PriceTjs { get; set; }
    public int MinOrderQuantity { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePriceListDto
{
    public int? BranchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PriceListType ListType { get; set; }
}

public class UpdatePriceListDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PriceListType ListType { get; set; }
    public bool IsActive { get; set; }
}

public class CreatePriceListItemDto
{
    public int RecipeId { get; set; }
    public decimal PriceTjs { get; set; }
    public int MinOrderQuantity { get; set; }
}

public class UpdatePriceListItemDto
{
    public decimal PriceTjs { get; set; }
    public int MinOrderQuantity { get; set; }
}

public class BulkPriceListItemDto
{
    public int RecipeId { get; set; }
    public decimal PriceTjs { get; set; }
    public int MinOrderQuantity { get; set; }
}
