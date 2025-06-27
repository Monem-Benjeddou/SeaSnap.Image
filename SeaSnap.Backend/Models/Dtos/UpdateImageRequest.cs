namespace SeaSnap.Backend.Models.Dtos;


public class UpdateImageRequest
{
    public string Description { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
}