using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeaSnap.Backend.Data;
using SeaSnap.Backend.Models;
using SeaSnap.Backend.Models.Dtos;
using SeaSnap.Backend.Services.Interfaces;
using SeaSnap.Backend.Services; // Ensure this is available if needed for other services.

namespace SeaSnap.Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ImageController(
    IImageStorageService imageStorage,
    ApplicationDbContext dbContext,
    ILogger<ImageController> logger,
    ITenantService tenantService) : ControllerBase // Inject ITenantService
{

    private static readonly List<string> AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    [HttpPost("bulk")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> BulkUpload([FromForm] BulkUploadRequest request)
    {
        if (request.Files == null || !request.Files.Any())
            return BadRequest("No files uploaded.");

        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized("User is not authenticated.");

        var companyId = tenantService.GetCurrentCompanyId();
        if (!companyId.HasValue)
            return Unauthorized("Company context not found for the authenticated user.");

        var results = new List<object>();

        foreach (var file in request.Files)
        {
            if (!IsValidImage(file, out var extension)) continue;

            var fileName = $"{Guid.NewGuid()}{extension}";
            var url = await imageStorage.UploadAsync(file, fileName);

            // Pass companyId to CreateMetadata
            dbContext.Images.Add(CreateMetadata(file, fileName, url, userId, companyId.Value, request.Description, request.Tags));
            results.Add(new { file = file.FileName, url });
        }

        await dbContext.SaveChangesAsync();
        return Ok(new { uploaded = results });
    }

    [HttpPut("{filename}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Update(string filename, [FromBody] UpdateImageRequest updateRequest)
    {
        if (string.IsNullOrWhiteSpace(filename))
            return BadRequest("Invalid filename.");

        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized("User is not authenticated.");

        var companyId = tenantService.GetCurrentCompanyId();
        if (!companyId.HasValue)
            return Unauthorized("Company context not found for the authenticated user.");
        
        var image = await dbContext.Images.FirstOrDefaultAsync(i => i.FileName == filename);
        if (image == null)
            return NotFound("Image not found.");

        // Double check ownership (user ID and company ID)
        if (image.UserId != userId || image.CompanyId != companyId.Value)
            return Forbid("You do not have permission to update this image.");

        image.Description = updateRequest.Description;
        image.Tags = updateRequest.Tags;
        dbContext.Images.Update(image);

        await dbContext.SaveChangesAsync();
        return Ok(new { message = "Image metadata updated successfully." });
    }

    [HttpPost("upload")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Upload([FromForm] UploadRequest fileRequest,
        [FromQuery]  string description = "",
        [FromQuery]  string tags="")
    {
        var file = fileRequest.FileFormFile;
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (!IsValidImage(file, out var extension))
            return BadRequest("Unsupported or invalid image format.");

        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized("User is not authenticated.");

        var companyId = tenantService.GetCurrentCompanyId();
        if (!companyId.HasValue)
            return Unauthorized("Company context not found for the authenticated user.");

        var fileName = $"{Guid.NewGuid()}{extension}";
        var url = await imageStorage.UploadAsync(file, fileName);

        // Pass companyId to CreateMetadata
        dbContext.Images.Add(CreateMetadata(file, fileName, url, userId, companyId.Value, description, tags));
        await dbContext.SaveChangesAsync();

        return Ok(new { url });
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll([FromQuery]int page = 1, [FromQuery]int pageSize = 10,[FromQuery] string? search = null)
    {
        if (page <= 0 || pageSize <= 0)
            return BadRequest("Invalid pagination parameters.");

        var query = dbContext.Images.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(i =>
                (i.Description != null && i.Description.Contains(search)) ||
                (i.Tags != null && i.Tags.Contains(search)));
        }

        var totalItems = await query.CountAsync();

        var images = await query
            .AsNoTracking()
            .Include(i => i.User)
            .OrderByDescending(i => i.UploadedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var imageDtos = new List<ImageMetadataDto>();

        foreach (var image in images)
        {
            imageDtos.Add(await ImageMetadataDto.FromEntityAsync(image, imageStorage));
        }

        return Ok(new PaginatedResult<ImageMetadataDto>
        {
            PageNumber = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            Items = imageDtos
        });
    }

    [HttpGet("{filename}")]
    public async Task<IActionResult> Get(string filename)
    {
        try
        {
            var companyId = tenantService.GetCurrentCompanyId();
            if (!companyId.HasValue)
                return Unauthorized("Company context not found."); // Or Forbid("Access denied.")

            var imageMetadata = await dbContext.Images.FirstOrDefaultAsync(i => i.FileName == filename && i.CompanyId == companyId.Value);
            if (imageMetadata == null)
                return NotFound("Image not found."); 

            var stream = await imageStorage.GetAsync(filename);
            return File(stream, "image/jpeg"); 
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching image: {Filename}", filename);
            return NotFound("Image not found or invalid format.");
        }
    }

    [HttpDelete("{filename}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Delete(string filename)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized("User is not authenticated.");

        var companyId = tenantService.GetCurrentCompanyId();
        if (!companyId.HasValue)
            return Unauthorized("Company context not found for the authenticated user.");

        // Find the image metadata first to ensure it belongs to the current user's company and user
        var imageToDelete = await dbContext.Images
                                            .FirstOrDefaultAsync(i => i.FileName == filename);

        if (imageToDelete == null)
            return NotFound("Image not found.");

        if (imageToDelete.UserId != userId || imageToDelete.CompanyId != companyId.Value)
            return Forbid("You do not have permission to delete this image.");

        var deletedFromStorage = await imageStorage.DeleteAsync(filename);
        if (!deletedFromStorage)
        {
            logger.LogError("Failed to delete image from storage: {Filename}", filename);
            return StatusCode(500, "Failed to delete image from storage.");
        }

        dbContext.Images.Remove(imageToDelete);
        await dbContext.SaveChangesAsync();

        return Ok("Image deleted successfully.");
    }

    [HttpGet("presigned/{filename}")]
    public async Task<IActionResult> GetPresignedUrl(string filename, int? minutes = 15)
    {
        var companyId = tenantService.GetCurrentCompanyId();
        if (!companyId.HasValue)
            return Unauthorized("Company context not found for the authenticated user.");
        var image = await dbContext.Images
                                    .AsNoTracking()
                                    .FirstOrDefaultAsync(i => i.FileName == filename && i.CompanyId == companyId.Value);

        if (image == null)
        {
            return NotFound("Image not found or you do not have permission to access it.");
        }

        var url = imageStorage.GetPreSignedUrl(filename, TimeSpan.FromMinutes(minutes ?? 15));
        return Ok(new { url });
    }

    [HttpGet("list")]
    public async Task<IActionResult> ListAll()
    {
        var companyId = tenantService.GetCurrentCompanyId();
        if (!companyId.HasValue)
            return Unauthorized("Company context not found for the authenticated user.");

        var images = await dbContext.Images
                                     .Where(i => i.CompanyId == companyId.Value)
                                     .Select(i => i.FileName) 
                                     .ToListAsync();
        return Ok(images);
    }


    private static bool IsValidImage(IFormFile file, out string extension)
    {
        extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        return file.ContentType.StartsWith("image/") && AllowedExtensions.Contains(extension);
    }

    private ImageMetadata CreateMetadata(
        IFormFile file,
        string fileName,
        string url,
        Guid userId,
        Guid companyId,
        string? description,
        string? tags
    ) => new()
    {
        FileName = fileName,
        Url = url,
        ContentType = file.ContentType,
        Size = file.Length,
        Description = description ?? string.Empty,
        Tags = tags ?? string.Empty,
        UploadedAt = DateTime.UtcNow,
        UserId = userId,
        CompanyId = companyId 
    };

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;

        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }
}