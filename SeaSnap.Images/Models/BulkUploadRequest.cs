namespace SeaSnap.Images.Models;

public class BulkUploadRequest
{
    public List<IFormFile>? Files { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
}
