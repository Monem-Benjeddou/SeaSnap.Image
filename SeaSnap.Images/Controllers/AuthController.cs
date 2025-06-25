using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SeaSnap.Images.Models;

namespace SeaSnap.Images.Controllers;

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
            createdAt = user.CreatedAt
        });
    }
}
