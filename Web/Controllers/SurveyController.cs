using Microsoft.AspNetCore.Mvc;
using Web.Services.Interfaces;
using Response = Web.Dto.Response;

namespace Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SurveyController(ISurveyService surveyService) : ControllerBase
{
    [HttpPost("upload")]
    public async Task<ActionResult<Response.Survey>> UploadDocx(IFormFile file)
    {
        if (file.Length == 0)
            return BadRequest("No file uploaded");

        if (Path.GetExtension(file.FileName).ToLower() != ".docx")
            return BadRequest("Invalid file format. Only DOCX allowed");
        var fileStream = new MemoryStream();
        await file.CopyToAsync(fileStream);
        try
        {
            var survey = surveyService.GetSurveyByDocx(fileStream);
            return survey;
        }
        catch
        {
            return StatusCode(500, "Error processing document");
        }
    }
}