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
    public Task<ActionResult<Response.Survey>> GetSurvey(Guid fileId)
    {
        try
        {
            var survey = surveyService.GetSurveyByDocx(fileId);
            return Task.FromResult<ActionResult<Response.Survey>>(survey.ToResponse());
        }
        catch (NotFoundException ex)
        {
            Console.WriteLine(ex);
            Console.WriteLine();
            Console.WriteLine();
            return Task.FromResult<ActionResult<Response.Survey>>(StatusCode(404, ex.Message));
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine(ex);
            Console.WriteLine();
            Console.WriteLine();

            return Task.FromResult<ActionResult<Response.Survey>>(StatusCode(400, ex.Message));
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            Console.WriteLine();
            Console.WriteLine();

            return Task.FromResult<ActionResult<Response.Survey>>(StatusCode(500, $"Error processing document. {ex.Message}"));
        }
    }

    [HttpPost]
    public Task<ActionResult<Response.InsertSurveyAnswerToDocumentResult>> InsertSurveyAnswerToDocument(
        Response.AnsweredSurvey answeredSurvey)
    {
        Console.WriteLine("\n\n\n--------------------------------------");
        var fileId = answeredSurveyService.FillDocByAnsweredSurvey(answeredSurvey.fileId, answeredSurvey.FromRequest());
        Console.WriteLine("\n\n\n--------------------------------------");
        return Task.FromResult<ActionResult<Response.InsertSurveyAnswerToDocumentResult>>(
            new Response.InsertSurveyAnswerToDocumentResult(fileId));
    }
}