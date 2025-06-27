using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeaSnap.Backend.Data;
using SeaSnap.Backend.Models;
using SeaSnap.Backend.Models.Dtos;
using SeaSnap.Backend.Services.Interfaces; // Assuming ITenantService is defined here

namespace SeaSnap.Backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class DashboardController(
        ApplicationDbContext dbContext,
        ITenantService tenantService,
        UserManager<User> userManager,
        IImageStorageService imageStorage,
        ILogger<DashboardController> logger) : ControllerBase
    {
        private readonly ILogger<DashboardController> _logger = logger;

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var companyId = tenantService.GetCurrentCompanyId();
            if (!companyId.HasValue)
            {
                return Unauthorized("Company context not found for the authenticated user.");
            }

            var currentUserId = GetUserId();
            if (currentUserId == Guid.Empty)
            {
                return Unauthorized("User is not authenticated.");
            }

            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endOfMonth = startOfMonth.AddMonths(1).AddSeconds(-1);
            
            var totalImages = await dbContext.Images.CountAsync();

            var storageUsedBytes = await dbContext.Images.SumAsync(i => i.Size);

            var uploadsThisMonth = await dbContext.Images
                .Where(i => i.UploadedAt >= startOfMonth && i.UploadedAt <= endOfMonth)
                .CountAsync();

            var activeUsersInCompany = await userManager.Users
                                                    .CountAsync(u => u.CompanyId == companyId.Value);

            var recentUploadsEntities = await dbContext.Images
                .AsNoTracking()
                .Include(i => i.User)
                .OrderByDescending(i => i.UploadedAt)
                .Take(3)
                .ToListAsync();

            var recentUploadsDtos = new List<ImageMetadataDto>();
            foreach (var img in recentUploadsEntities)
            {
                recentUploadsDtos.Add(await ImageMetadataDto.FromEntityAsync(img, imageStorage));
            }

            var stats = new DashboardStatsDto
            {
                TotalImages = totalImages,
                StorageUsedBytes = storageUsedBytes,
                UploadsThisMonth = uploadsThisMonth,
                DownloadsThisMonth = 0,
                ActiveUsers = activeUsersInCompany,
                RecentUploads = recentUploadsDtos
            };

            return Ok(stats);
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst("sub")?.Value;

            return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
        }
    }
}
