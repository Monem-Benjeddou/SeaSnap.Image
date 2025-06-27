using SeaSnap.Backend.Services.Interfaces;
using SeaSnap.Backend.Services;

namespace SeaSnap.Backend.Models.Dtos;

public class ImageMetadataDto
{
    public string Id { get; set; }
    public string Filename { get; set; }
    public string Description { get; set; }
    public List<string> Tags { get; set; }
    public string Url { get; set; }
    public string ThumbnailUrl { get; set; }
    public long Size { get; set; }
    public string MimeType { get; set; }
    public DateTime UploadedAt { get; set; }
    public UploadedByDto UploadedBy { get; set; }

    public static async Task<ImageMetadataDto> FromEntityAsync(
        ImageMetadata image,
        IImageStorageService imageStorage
    )
    {
        return new ImageMetadataDto
        {
            Id = image.Id.ToString(),
            Filename = image.FileName,
            Description = image.Description,
            Tags = string.IsNullOrWhiteSpace(image.Tags)
                ? new List<string>()
                : image.Tags.Split(',').Select(t => t.Trim()).ToList(),
            Url = image.Url,
            ThumbnailUrl =  imageStorage.GetPreSignedUrl(image.FileName),
            Size = image.Size,
            MimeType = image.ContentType,
            UploadedAt = image.UploadedAt,
            UploadedBy = new UploadedByDto
            {
                Id = image.User.Id.ToString(),
                Email = image.User.Email,
                UserName = image.User.FullName,
                Role = image.User.Role,
                CreatedAt = image.User.CreatedAt
            }
        };
    }
}

public class UploadedByDto
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string UserName { get; set; }
    public string Role { get; set; }
    public DateTime CreatedAt { get; set; }
}