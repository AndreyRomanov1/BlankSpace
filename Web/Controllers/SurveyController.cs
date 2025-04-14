using Domain.Exceptions;
using Domain.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Web.MappingExtensions;
using Response = Web.Dto.Response;

namespace Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SurveyController(
    ISurveyService surveyService,
    IAnsweredSurveyService answeredSurveyService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<Response.Survey>> GetSurvey(Guid fileId)
    {
        try
        {
            var survey = surveyService.GetSurveyByDocx(fileId);
            return survey.ToResponse();
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

    [HttpPost]
    public async Task<ActionResult<Response.InsertSurveyAnswerToDocumentResult>> InsertSurveyAnswerToDocument(
        Response.AnsweredSurvey answeredSurvey)
    {
        Console.WriteLine("\n\n\n--------------------------------------");
        var fileId = answeredSurveyService.FillDocByAnsweredSurvey(answeredSurvey.fileId, answeredSurvey.FromRequest());
        Console.WriteLine("\n\n\n--------------------------------------");
        return new Response.InsertSurveyAnswerToDocumentResult(fileId);
    }
}