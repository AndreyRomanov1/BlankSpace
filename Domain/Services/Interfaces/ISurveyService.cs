using Domain.Objects.Survey;

namespace Domain.Services.Interfaces;

public interface ISurveyService
{
    Survey GetSurveyByDocx(Guid fileId);
}