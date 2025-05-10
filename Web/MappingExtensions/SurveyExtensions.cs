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

    private static Response.Question ToResponse(this QuestionView questionView)
    {
        return new Response.Question(
            questionView.QuestionType.ToResponse(),
            questionView.Name,
            questionView.SubQuestionByAnswer.ToDictionary(t => t.Key,
                t => t.Value.Select(t => t.ToResponse()).ToArray()));
    }

    private static Response.QuestionType ToResponse(this QuestionType questionType)
    {
        return questionType switch
        {
            QuestionType.IfQuestion => Response.QuestionType.If,
            QuestionType.InputQuestion => Response.QuestionType.Input,
            _ => throw new ArgumentOutOfRangeException(nameof(questionType), questionType, null)
        };
    }

    public static AnsweredSurvey FromRequest(this Response.AnsweredSurvey answeredSurvey)
    {
        return new AnsweredSurvey(answeredSurvey.answeredQuestions.Select(t => t.FromRequest()).ToArray());
    }

    private static AnsweredQuestionView FromRequest(this Response.AnsweredQuestion answeredQuestion)
    {
        return new AnsweredQuestionView(
            answeredQuestion.Name,
            answeredQuestion.SubQuestionsByAnswer
                .ToDictionary(
                    t => t.Key,
                    t => t.Value.Select(t2 => t2.FromRequest()).ToArray()),
            answeredQuestion.questionType.FromRequest(),
            answeredQuestion.QuestionAnswer);
    }

    private static QuestionType FromRequest(this Response.QuestionType questionType)
    {
        return questionType switch
        {
            Response.QuestionType.If => QuestionType.IfQuestion,
            Response.QuestionType.Input => QuestionType.InputQuestion,
            _ => throw new ArgumentOutOfRangeException(nameof(questionType), questionType, null)
        };
    }
}