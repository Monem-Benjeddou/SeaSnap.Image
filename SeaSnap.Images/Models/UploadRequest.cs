using Microsoft.AspNetCore.Mvc;

namespace SeaSnap.Images.Models;

public class UploadRequest
{    
    [FromForm]
    public IFormFile FileFormFile { get; set; }
}