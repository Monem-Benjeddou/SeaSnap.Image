using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using SeaSnap.Backend.Services.Interfaces;
using SeaSnap.Backend.Models;

namespace SeaSnap.Backend.Services.Implementation;

public class TenantService : ITenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? GetCurrentCompanyId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null || !httpContext.User.Identity.IsAuthenticated)
        {
            return null; 
        }

        var companyIdClaim = httpContext.User.FindFirst("CompanyId");
        if (companyIdClaim != null && Guid.TryParse(companyIdClaim.Value, out var companyId))
        {
            return companyId;
        }
        return null;
    }
}