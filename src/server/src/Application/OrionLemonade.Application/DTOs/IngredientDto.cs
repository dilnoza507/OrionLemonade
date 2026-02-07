using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class IngredientDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public IngredientCategory Category { get; set; }
    public string? Subcategory { get; set; }
    public BaseUnit BaseUnit { get; set; }
    public string? PurchaseUnit { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal? MinStock { get; set; }
    public int? ShelfLifeDays { get; set; }
    public IngredientStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateIngredientDto
{
    public string Name { get; set; } = string.Empty;
    public IngredientCategory Category { get; set; }
    public string? Subcategory { get; set; }
    public BaseUnit BaseUnit { get; set; }
    public string? PurchaseUnit { get; set; }
    public decimal ConversionRate { get; set; } = 1;
    public decimal? MinStock { get; set; }
    public int? ShelfLifeDays { get; set; }
}

public class UpdateIngredientDto
{
    public string Name { get; set; } = string.Empty;
    public IngredientCategory Category { get; set; }
    public string? Subcategory { get; set; }
    public BaseUnit BaseUnit { get; set; }
    public string? PurchaseUnit { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal? MinStock { get; set; }
    public int? ShelfLifeDays { get; set; }
    public IngredientStatus Status { get; set; }
}
