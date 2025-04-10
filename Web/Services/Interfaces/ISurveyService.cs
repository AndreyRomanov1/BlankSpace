using Response = Web.Dto.Response;

namespace Web.Services.Interfaces;

public interface ISurveyService
{
    Response.Survey GetSurveyByDocx(Stream fileStream);
}