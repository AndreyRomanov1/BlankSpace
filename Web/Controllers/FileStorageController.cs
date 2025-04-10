using Domain.Exceptions;
using Domain.Objects.Storage;
using Domain.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileStorageController(IFileStorageRepository fileStorageRepository) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> UploadFile(IFormFile formFile)
    {
        if (formFile.Length == 0)
            return BadRequest("No file uploaded");

        try
        {
            await using var stream = formFile.OpenReadStream();
            var contentFile = new ContentFile(formFile.FileName, stream);
            var fileId = fileStorageRepository.AddFile(contentFile, TimeSpan.FromHours(12));
            return fileId;
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id:guid}")]
    public IActionResult DownloadFile(Guid id)
    {
        try
        {
            var contentFile = fileStorageRepository.GetFile(id);

            return File(contentFile.Stream, "application/octet-stream", contentFile.Name);
        }
        catch (NotFoundException)
        {
            return StatusCode(404);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}