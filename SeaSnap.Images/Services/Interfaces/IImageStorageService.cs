namespace SeaSnap.Images.Services.Interfaces;

public interface IImageStorageService
{
    Task<string> UploadAsync(IFormFile stream, string fileName);
    Task<Stream> GetAsync(string key);
    Task<bool> DeleteAsync(string key);
    string GetPreSignedUrl(string key, TimeSpan? ttl = null);
    Task<IReadOnlyList<string>> ListAllAsync(string? prefix = null);
}