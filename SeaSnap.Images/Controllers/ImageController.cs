using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeaSnap.Images.Data;
using SeaSnap.Images.Models;
using SeaSnap.Images.Models.Dtos;
using SeaSnap.Images.Services;
using SeaSnap.Images.Services.Interfaces;

namespace SeaSnap.Images.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ImageController(
    IImageStorageService imageStorage,
    ApplicationDbContext dbContext,
    ILogger<ImageController> logger) : ControllerBase
{
    private static readonly List<string> AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];


    [HttpPost("bulk")]
    public async Task<IActionResult> BulkUpload([FromForm] BulkUploadRequest request)
    {
        if (request.Files == null || !request.Files.Any())
            return BadRequest("No files uploaded.");

        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized("User is not authenticated.");

        var results = new List<object>();

        foreach (var file in request.Files)
        {
            if (!IsValidImage(file, out var extension)) continue;

            var fileName = $"{Guid.NewGuid()}{extension}";
            var url = await imageStorage.UploadAsync(file, fileName);

            dbContext.Images.Add(CreateMetadata(file, fileName, url, userId, request.Description, request.Tags));
            results.Add(new { file = file.FileName, url });
        }

        await dbContext.SaveChangesAsync();
        return Ok(new { uploaded = results });
    }

    [HttpPut("{filename}")]
    public async Task<IActionResult> Update(string filename, [FromBody] UpdateImageRequest updateRequest)
    {
        if (string.IsNullOrWhiteSpace(filename))
            return BadRequest("Invalid filename.");

        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized("User is not authenticated.");

        var image = await dbContext.Images.FirstOrDefaultAsync(i => i.FileName == filename);
        if (image == null)
            return NotFound("Image not found.");

        if (image.UserId != userId)
            return Forbid("You do not have permission to update this image.");

        image.Description = updateRequest.Description;
        image.Tags = updateRequest.Tags;
        dbContext.Images.Update(image);

        await dbContext.SaveChangesAsync();
        return Ok(new { message = "Image metadata updated successfully." });
    }
    
    [HttpPost("upload")]
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

        var fileName = $"{Guid.NewGuid()}{extension}";
        var url = await imageStorage.UploadAsync(file, fileName);

        dbContext.Images.Add(CreateMetadata(file, fileName, url, userId, description, tags));
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

        var images = await dbContext.Images
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
    [AllowAnonymous]
    public async Task<IActionResult> Get(string filename)
    {
        try
        {
            var stream = await imageStorage.GetAsync(filename);
            return File(stream, "image/jpeg");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching image: {Filename}", filename);
            return NotFound("Image not found or invalid format.");
        }
    }

    // -------- Delete Endpoint --------

    [HttpDelete("{filename}")]
    public async Task<IActionResult> Delete(string filename)
    {
        var deleted = await imageStorage.DeleteAsync(filename);
        if (!deleted) return NotFound("Image not found.");

        var image = await dbContext.Images.FirstOrDefaultAsync(x => x.FileName == filename);
        if (image != null)
        {
            dbContext.Images.Remove(image);
            await dbContext.SaveChangesAsync();
        }

        return Ok("Deleted successfully.");
    }

    // -------- Utility Endpoints --------

    [HttpGet("presigned/{filename}")]
    public IActionResult GetPresignedUrl(string filename, int? minutes = 15)
    {
        var url = imageStorage.GetPreSignedUrl(filename, TimeSpan.FromMinutes(minutes ?? 15));
        return Ok(new { url });
    }

    [HttpGet("list")]
    public async Task<IActionResult> ListAll()
    {
        var keys = await imageStorage.ListAllAsync();
        return Ok(keys);
    }

    // -------- Helpers --------

    private static bool IsValidImage(IFormFile file, out string extension)
    {
        extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        return file.ContentType.StartsWith("image/") && AllowedExtensions.Contains(extension);
    }

    private static ImageMetadata CreateMetadata(
        IFormFile file,
        string fileName,
        string url,
        Guid userId,
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
        UserId = userId
    };

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;

        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }
}
