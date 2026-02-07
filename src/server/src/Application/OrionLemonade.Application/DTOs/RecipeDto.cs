using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

// Recipe DTOs
public class RecipeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal OutputVolume { get; set; }
    public BaseUnit OutputUnit { get; set; }
    public RecipeStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public RecipeVersionDto? ActiveVersion { get; set; }
    public int VersionCount { get; set; }
}

public class RecipeDetailDto : RecipeDto
{
    public List<RecipeVersionDto> Versions { get; set; } = new();
}

public class CreateRecipeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal OutputVolume { get; set; }
    public BaseUnit OutputUnit { get; set; }
}

public class UpdateRecipeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal OutputVolume { get; set; }
    public BaseUnit OutputUnit { get; set; }
    public RecipeStatus Status { get; set; }
}

// RecipeVersion DTOs
public class RecipeVersionDto
{
    public int Id { get; set; }
    public int RecipeId { get; set; }
    public int VersionNumber { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<RecipeIngredientDto> Ingredients { get; set; } = new();
    public List<RecipePackagingDto> Packaging { get; set; } = new();
}

public class CreateRecipeVersionDto
{
    public int RecipeId { get; set; }
    public string? Notes { get; set; }
    public List<CreateRecipeIngredientDto> Ingredients { get; set; } = new();
    public List<CreateRecipePackagingDto> Packaging { get; set; } = new();
}

public class UpdateRecipeVersionDto
{
    public string? Notes { get; set; }
    public List<CreateRecipeIngredientDto> Ingredients { get; set; } = new();
    public List<CreateRecipePackagingDto> Packaging { get; set; } = new();
}

// RecipeIngredient DTOs
public class RecipeIngredientDto
{
    public int Id { get; set; }
    public int RecipeVersionId { get; set; }
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }
}

public class CreateRecipeIngredientDto
{
    public int IngredientId { get; set; }
    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }
}

// RecipePackaging DTOs
public class RecipePackagingDto
{
    public int Id { get; set; }
    public int RecipeVersionId { get; set; }
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }
}

public class CreateRecipePackagingDto
{
    public int IngredientId { get; set; }
    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }
}
