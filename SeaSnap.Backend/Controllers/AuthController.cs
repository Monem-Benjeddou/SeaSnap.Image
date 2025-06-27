using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SeaSnap.Backend.Models;
using SeaSnap.Backend.Models.Dtos;

namespace SeaSnap.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AuthController(UserManager<User> userManager) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        var roles = await userManager.GetRolesAsync(user);

        return Ok(new
        {
            id = user.Id,
            username = user.UserName,
            email = user.Email,
            roles = roles,
            createdAt = user.CreatedAt,
            CompanyId = user.CompanyId,
        });
    }

    [HttpGet("generateuser")]
    public IActionResult GenerateUserSpecificData()
    {
        var userId = GetUserId(); 
        if (userId == Guid.Empty)
            return Unauthorized("User is not authenticated.");

        return Ok(new { Message = $"User-specific data generated for user ID: {userId}. This endpoint is for you, {User.Identity.Name}!", UserId = userId });
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;

        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }
}