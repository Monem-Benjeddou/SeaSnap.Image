namespace SeaSnap.Backend.Models.Dtos;

public class DashboardStatsDto
{
    public int TotalImages { get; set; }
    public long StorageUsedBytes { get; set; }
    public long StorageLimitBytes { get; set; } = 50L * 1024 * 1024 * 1024;
    public int UploadsThisMonth { get; set; }
    public int DownloadsThisMonth { get; set; }
    public int ActiveUsers { get; set; }
    public List<ImageMetadataDto> RecentUploads { get; set; } = [];
}