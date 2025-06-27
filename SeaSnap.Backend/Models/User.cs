using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace SeaSnap.Backend.Models;

public class User : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    [NotMapped]
    public string Role { get; set; }
    public ICollection<ImageMetadata>? Images { get; set; }
    public Guid CompanyId { get; set; } // Non-nullable
    public Company Company { get; set; } // Navigation property
}