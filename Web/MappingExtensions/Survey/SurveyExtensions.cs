using Domain.Objects.Questions;
using Response = Web.Dto.Response;

namespace Web.MappingExtensions.Survey;

public static class SurveyExtensions
{
    public static Response.Survey ToResponse(this Question[] questions)
    {
        return new Response.Survey(questions.Select(t => t.GetView().ToResponse()).ToArray());
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