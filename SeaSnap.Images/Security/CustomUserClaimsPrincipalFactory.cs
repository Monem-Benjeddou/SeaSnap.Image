using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using SeaSnap.Images.Models;

namespace SeaSnap.Images.Security;

 public class CustomUserClaimsPrincipalFactory(
    UserManager<User> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    IOptions<IdentityOptions> optionsAccessor)
    : UserClaimsPrincipalFactory<User, IdentityRole<Guid>>(userManager, roleManager, optionsAccessor)
{
    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(User user)
    {
        var identity = await base.GenerateClaimsAsync(user);
        identity.AddClaim(new Claim("CompanyId", user.CompanyId.ToString()));
        return identity;
    }
}