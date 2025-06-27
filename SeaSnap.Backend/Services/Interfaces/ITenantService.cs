namespace SeaSnap.Backend.Services.Interfaces;

public interface ITenantService
{
    Guid? GetCurrentCompanyId();
}