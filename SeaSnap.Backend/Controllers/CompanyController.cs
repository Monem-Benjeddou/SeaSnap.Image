using SeaSnap.Backend.Data;
using SeaSnap.Backend.Models;
using SeaSnap.Backend.Models.Dtos;
using SeaSnap.Backend.Services.Interfaces;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace SeaSnap.Backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class CompanyController(
        ApplicationDbContext dbContext,
        ITenantService tenantService,
        UserManager<User> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        ILogger<CompanyController> logger) : ControllerBase
    {
        private readonly RoleManager<IdentityRole<Guid>> _roleManager = roleManager;


        [HttpGet("my-company")]
        public async Task<IActionResult> GetMyCompanyDetails()
        {
            var companyId = tenantService.GetCurrentCompanyId();
            if (!companyId.HasValue)
                return Unauthorized("Company context not found for the authenticated user.");

            var company = await dbContext.Companies.AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == companyId.Value);

            if (company == null)
                return NotFound("Company details not found.");

            return Ok(new CompanyDto
            {
                Id = company.Id,
                Name = company.Name,
                CreatedAt = company.CreatedAt
            });
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> GetCompanyUsers()
        {
            var companyId = tenantService.GetCurrentCompanyId();
            if (!companyId.HasValue)
                return Unauthorized("Company context not found for the authenticated user.");
            
            var users = await userManager.Users
                .Where(u => u.CompanyId == companyId.Value) 
                .ToListAsync();

            var userDtos = new List<UserDto>();
            foreach (var user in users)
            {
                var roles = await userManager.GetRolesAsync(user);
                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    FullName = user.FullName,
                    Email = user.Email,
                    Roles = roles.ToList(),
                    CreatedAt = user.CreatedAt,
                    CompanyId = user.CompanyId
                });
            }

            return Ok(userDtos);
        }

        [HttpPost("users/invite")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> InviteUser([FromBody] InviteUserDto inviteDto)
        {
            var currentCompanyId = tenantService.GetCurrentCompanyId();

            if (!currentCompanyId.HasValue)
                return Unauthorized("Company context not found.");

            var allowedRoles = new List<string> { "Editor", "Viewer" };
            if (!allowedRoles.Contains(inviteDto.Role))
            {
                return BadRequest($"Invalid role specified. Allowed roles are: {string.Join(", ", allowedRoles)}.");
            }

            var user = new User
            {
                UserName = inviteDto.Email,
                Email = inviteDto.Email,
                FullName = inviteDto.FullName,
                EmailConfirmed = true, 
                CompanyId = currentCompanyId.Value,
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(user, inviteDto.Password);
            if (!result.Succeeded)
            {
                logger.LogWarning("Failed to create user: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                return BadRequest(result.Errors);
            }

            result = await userManager.AddToRoleAsync(user, inviteDto.Role);
            if (!result.Succeeded)
            {
                logger.LogError("Failed to add role {Role} to user {Email}. Deleting user.", inviteDto.Role, inviteDto.Email);
                await userManager.DeleteAsync(user);
                return StatusCode(500, "Failed to assign role to user.");
            }

            return Ok(new { Message = "User created and assigned role successfully." });
        }

        [HttpDelete("users/{userId:guid}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            var currentCompanyId = tenantService.GetCurrentCompanyId();
            if (!currentCompanyId.HasValue)
                return Unauthorized("Company context not found.");

            var userToDelete = await userManager.FindByIdAsync(userId.ToString());
            if (userToDelete == null)
                return NotFound("User not found.");

            if (userToDelete.CompanyId != currentCompanyId.Value)
                return Forbid("You do not have permission to delete users outside your company.");

            if (userToDelete.Id == Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)))
            {
                return BadRequest("Company Admin cannot delete their own account.");
            }

            var result = await userManager.DeleteAsync(userToDelete);
            if (!result.Succeeded)
            {
                logger.LogWarning("Failed to delete user {UserId}: {Errors}", userId, string.Join(", ", result.Errors.Select(e => e.Description)));
                return BadRequest(result.Errors);
            }

            return Ok(new { Message = "User deleted successfully." });
        }

        [HttpPut("users/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserRole([FromBody] UpdateUserRoleDto updateRoleDto)
        {
            var currentCompanyId = tenantService.GetCurrentCompanyId();
            if (!currentCompanyId.HasValue)
                return Unauthorized("Company context not found.");

            var userToUpdate = await userManager.FindByIdAsync(updateRoleDto.UserId.ToString());
            if (userToUpdate == null)
                return NotFound("User not found.");

            // Crucial security check: Ensure the user being updated belongs to the current admin's company
            if (userToUpdate.CompanyId != currentCompanyId.Value)
                return Forbid("You do not have permission to modify users outside your company.");

            // Validate new role is one that a Admin is allowed to assign
            var allowedRoles = new List<string> { "Editor", "Viewer" };
            if (!allowedRoles.Contains(updateRoleDto.NewRole))
            {
                return BadRequest($"Invalid role specified. Allowed roles are: {string.Join(", ", allowedRoles)}.");
            }

            // Get current roles
            var currentRoles = await userManager.GetRolesAsync(userToUpdate);

            // Remove old roles and add new role
            var removeResult = await userManager.RemoveFromRolesAsync(userToUpdate, currentRoles);
            if (!removeResult.Succeeded)
            {
                logger.LogWarning("Failed to remove old roles for user {UserId}: {Errors}", updateRoleDto.UserId, string.Join(", ", removeResult.Errors.Select(e => e.Description)));
                return BadRequest(removeResult.Errors);
            }

            var addResult = await userManager.AddToRoleAsync(userToUpdate, updateRoleDto.NewRole);
            if (!addResult.Succeeded)
            {
                logger.LogWarning("Failed to add new role {NewRole} for user {UserId}: {Errors}", updateRoleDto.NewRole, updateRoleDto.UserId, string.Join(", ", addResult.Errors.Select(e => e.Description)));
                return BadRequest(addResult.Errors);
            }

            return Ok(new { Message = $"User {userToUpdate.UserName}'s role updated to {updateRoleDto.NewRole} successfully." });
        }
    }
}