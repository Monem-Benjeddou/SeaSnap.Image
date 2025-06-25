namespace SeaSnap.Images.Models;

public class Company
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<User>? Users { get; set; }
    public ICollection<ImageMetadata>? Images { get; set; } // Images directly owned by the company
}