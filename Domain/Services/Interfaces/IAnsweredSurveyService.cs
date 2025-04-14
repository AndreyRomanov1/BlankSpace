using Domain.Objects.Survey;

namespace Domain.Services.Interfaces;

public interface IAnsweredSurveyService
{
    public Guid FillDocByAnsweredSurvey(Guid fileId, AnsweredSurvey answeredSurvey);
}