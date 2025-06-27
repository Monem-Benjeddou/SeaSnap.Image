using Microsoft.AspNetCore.Mvc;

namespace SeaSnap.Backend.Models;

public class UploadRequest
{    
    [FromForm]
    public IFormFile FileFormFile { get; set; }
}