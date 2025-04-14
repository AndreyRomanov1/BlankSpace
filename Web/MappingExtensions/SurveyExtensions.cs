using Domain.Objects.Questions;
using Domain.Objects.Survey;
using Response = Web.Dto.Response;

namespace Web.MappingExtensions;

public static class SurveyExtensions
{
    public static Response.Survey ToResponse(this Survey survey)
    {
        return new Response.Survey(survey.Questions.Select(t => t.GetView().ToResponse()).ToArray());
    }

    public static Response.Question ToResponse(this QuestionView questionView)
    {
        return new Response.Question(
            questionView.QuestionType.ToResponse(),
            questionView.Name,
            questionView.SubQuestionByAnswer.ToDictionary(t => t.Key,
                t => t.Value.Select(t => t.ToResponse()).ToArray()));
    }

    public static Response.QuestionType ToResponse(this QuestionType questionType)
    {
        return questionType switch
        {
            QuestionType.IfQuestion => Response.QuestionType.If,
            QuestionType.InputQuestion => Response.QuestionType.Input,
            _ => throw new ArgumentOutOfRangeException(nameof(questionType), questionType, null)
        };
    }
}