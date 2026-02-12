using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class Recipe : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal OutputVolume { get; set; }
    public BaseUnit OutputUnit { get; set; } = BaseUnit.L;
    public decimal StandardBatchSize { get; set; } = 1; // Стандартный размер партии (кол-во продукции, на которое рассчитана рецептура)
    public RecipeStatus Status { get; set; } = RecipeStatus.Draft;

    public ICollection<RecipeVersion> Versions { get; set; } = new List<RecipeVersion>();
}
