using Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Web.Services.Interfaces;
using Response = Web.Dto.Response;

namespace Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SurveyController(ISurveyService surveyService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<Response.Survey>> GetSurvey(Guid fileId)
    {
        try
        {
            var survey = surveyService.GetSurveyByDocx(fileId);
            return survey;
        }
        catch (NotFoundException ex)
        {
            return StatusCode(404, ex.Message);
        }
        catch (ArgumentException ex)
        {
            return StatusCode(400, ex.Message);
        }
        catch
        {
            return StatusCode(500, "Error processing document");
        }
    }
}