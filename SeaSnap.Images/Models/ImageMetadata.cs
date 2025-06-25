using System.ComponentModel.DataAnnotations;

namespace SeaSnap.Images.Models;

public class ImageMetadata
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string FileName { get; set; }

    [Required]
    public string Url { get; set; }

    [Required]
    public string ContentType { get; set; }

    public long Size { get; set; }
    public string Description { get; set; }
    public DateTime UploadedAt { get; set; }
    public User User { get; set; }
    public Guid UserId { get; set; }
    public string Tags { get; set; }
    public Guid CompanyId { get; set; }
    public Company Company { get; set; }
}