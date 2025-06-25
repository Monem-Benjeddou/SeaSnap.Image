namespace SeaSnap.Images.Models;

public class PaginatedResult<T>
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public IReadOnlyList<T> Items { get; set; } = [];
}
