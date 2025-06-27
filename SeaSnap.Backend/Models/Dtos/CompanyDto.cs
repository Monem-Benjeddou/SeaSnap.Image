using System.ComponentModel.DataAnnotations;

namespace SeaSnap.Backend.Models.Dtos;
public class CompanyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class UserDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public Guid CompanyId { get; set; }
}

public class InviteUserDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    [Required]
    public string FullName { get; set; }
    [Required]
    public string Role { get; set; } 
    public string Password { get; set; } = string.Empty;
}

public class UpdateUserRoleDto
{
    [Required]
    public Guid UserId { get; set; }
    [Required]
    public string NewRole { get; set; } 
}