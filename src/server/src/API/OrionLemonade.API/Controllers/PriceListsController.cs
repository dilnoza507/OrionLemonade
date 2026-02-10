using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[ApiController]
[Route("api/price-lists")]
[Authorize]
public class PriceListsController : ControllerBase
{
    private readonly IPriceListService _priceListService;

    public PriceListsController(IPriceListService priceListService)
    {
        _priceListService = priceListService;
    }

    #region Price Lists

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PriceListDto>>> GetPriceLists(
        [FromQuery] int? branchId,
        [FromQuery] bool? isActive)
    {
        var priceLists = await _priceListService.GetPriceListsAsync(branchId, isActive);
        return Ok(priceLists);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PriceListDto>> GetPriceList(int id)
    {
        var priceList = await _priceListService.GetPriceListByIdAsync(id);
        if (priceList == null)
            return NotFound();
        return Ok(priceList);
    }

    [HttpGet("{id}/detail")]
    public async Task<ActionResult<PriceListDetailDto>> GetPriceListDetail(int id)
    {
        var priceList = await _priceListService.GetPriceListDetailAsync(id);
        if (priceList == null)
            return NotFound();
        return Ok(priceList);
    }

    [HttpPost]
    public async Task<ActionResult<PriceListDto>> CreatePriceList([FromBody] CreatePriceListDto dto)
    {
        var priceList = await _priceListService.CreatePriceListAsync(dto);
        return CreatedAtAction(nameof(GetPriceList), new { id = priceList.Id }, priceList);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PriceListDto>> UpdatePriceList(int id, [FromBody] UpdatePriceListDto dto)
    {
        var priceList = await _priceListService.UpdatePriceListAsync(id, dto);
        if (priceList == null)
            return NotFound();
        return Ok(priceList);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePriceList(int id)
    {
        var deleted = await _priceListService.DeletePriceListAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }

    #endregion

    #region Price List Items

    [HttpGet("{priceListId}/items")]
    public async Task<ActionResult<IEnumerable<PriceListItemDto>>> GetItems(int priceListId)
    {
        var items = await _priceListService.GetPriceListItemsAsync(priceListId);
        return Ok(items);
    }

    [HttpGet("items/{id}")]
    public async Task<ActionResult<PriceListItemDto>> GetItem(int id)
    {
        var item = await _priceListService.GetPriceListItemAsync(id);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpPost("{priceListId}/items")]
    public async Task<ActionResult<PriceListItemDto>> AddItem(int priceListId, [FromBody] CreatePriceListItemDto dto)
    {
        var item = await _priceListService.AddItemAsync(priceListId, dto);
        return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
    }

    [HttpPut("items/{id}")]
    public async Task<ActionResult<PriceListItemDto>> UpdateItem(int id, [FromBody] UpdatePriceListItemDto dto)
    {
        var item = await _priceListService.UpdateItemAsync(id, dto);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpDelete("items/{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var deleted = await _priceListService.DeleteItemAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }

    [HttpPost("{priceListId}/items/bulk")]
    public async Task<IActionResult> BulkUpdateItems(int priceListId, [FromBody] List<BulkPriceListItemDto> items)
    {
        await _priceListService.BulkUpdateItemsAsync(priceListId, items);
        return Ok(new { message = "Items updated successfully" });
    }

    #endregion

    #region Price Lookup

    [HttpGet("{priceListId}/price/{recipeId}")]
    public async Task<ActionResult<decimal>> GetPrice(int priceListId, int recipeId)
    {
        var price = await _priceListService.GetPriceAsync(priceListId, recipeId);
        if (price == null)
            return NotFound(new { message = "Price not found for this recipe" });
        return Ok(price);
    }

    #endregion
}
