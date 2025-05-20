using Domain.Exceptions;
using Domain.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Web.MappingExtensions;
using ResponseDto = Web.Dto.Response;

namespace Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SurveyController(
    ISurveyService surveyService,
    IAnsweredSurveyService answeredSurveyService,
    IMetricsService metricsService) : ControllerBase
{
    private const string VariabilityMetric = "Variability";
    private const string FilledVariabilityMetric = "FilleddVariability";
    private const string FieldCountMetric = "FieldCount";
    private const string GenerationCountMetric = "GenerationCount";

    [HttpGet]
    public Task<ActionResult<ResponseDto.Survey>> GetSurvey(Guid fileId)
    {
        try
        {
            var survey = surveyService.GetSurveyByDocx(fileId);
            var response = survey.ToResponse();
            try
            {
                SaveGetSurveyMetrics(response, fileId);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Не удалось сохранить метрики: {e}");
                throw;
            }

            return Task.FromResult<ActionResult<ResponseDto.Survey>>(response);
        }
        catch (NotFoundException ex)
        {
            Console.WriteLine(ex);
            Console.WriteLine();
            Console.WriteLine();
            return Task.FromResult<ActionResult<ResponseDto.Survey>>(StatusCode(404, ex.Message));
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine(ex);
            Console.WriteLine();
            Console.WriteLine();

            return Task.FromResult<ActionResult<ResponseDto.Survey>>(StatusCode(400, ex.Message));
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            Console.WriteLine();
            Console.WriteLine();

            return Task.FromResult<ActionResult<ResponseDto.Survey>>(StatusCode(500, ex.Message));
        }
    }

    [HttpPost]
    public Task<ActionResult<ResponseDto.InsertSurveyAnswerToDocumentResult>> InsertSurveyAnswerToDocument(
        ResponseDto.AnsweredSurvey answeredSurvey)
    {
        Console.WriteLine("\n\n\n--------------------------------------");
        try
        {
            SaveInsertSurveyAnswerToDocumentMetrics(answeredSurvey);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Не удалось сохранить метрики: {e}");
            throw;
        }

        var fileId = answeredSurveyService.FillDocByAnsweredSurvey(answeredSurvey.FileId, answeredSurvey.FromRequest());
        Console.WriteLine("\n\n\n--------------------------------------");
        return Task.FromResult<ActionResult<ResponseDto.InsertSurveyAnswerToDocumentResult>>(
            new ResponseDto.InsertSurveyAnswerToDocumentResult(fileId));
    }

    private void SaveGetSurveyMetrics(ResponseDto.Survey survey, Guid fileId)
    {
        var sum = survey.Questions.Sum(GetQuestionSum);
        metricsService.SaveMetricValue(VariabilityMetric, fileId, new { Sum = sum });
        var questionFlatList = new List<ResponseDto.Question>();
        foreach (var question in survey.Questions)
            questionFlatList.AddRange(GetQuestionFlatList(question));
        metricsService.SaveMetricValue(FieldCountMetric, fileId,
            new
            {
                FieldCount = questionFlatList.Count,
                QuestionFlatList = questionFlatList,
            });
    }

    private static List<ResponseDto.Question> GetQuestionFlatList(ResponseDto.Question question)
    {
        var questionFlatList = new List<ResponseDto.Question> { question };

        foreach (var (_, subQuestions) in question.SubQuestionsByAnswer)
        foreach (var subQuestion in subQuestions)
            questionFlatList.AddRange(GetQuestionFlatList(subQuestion));
        return questionFlatList;
    }

    private static long GetQuestionSum(ResponseDto.Question question)
    {
        if (question.QuestionType != ResponseDto.QuestionType.If)
            return 0L;
        var sum = 0L;

        foreach (var (_, subQuestions) in question.SubQuestionsByAnswer)
            sum += subQuestions.Any(t => t.QuestionType == ResponseDto.QuestionType.If)
                ? subQuestions.Sum(GetQuestionSum)
                : 1L;

        return sum;
    }

    private void SaveInsertSurveyAnswerToDocumentMetrics(ResponseDto.AnsweredSurvey answeredSurvey)
    {
        var questionFlatList = new List<ResponseDto.AnsweredQuestion>();
        foreach (var answeredQuestion in answeredSurvey.AnsweredQuestions)
            questionFlatList.AddRange(GetAnsweredQuestionFlatList(answeredQuestion));

        metricsService.SaveMetricValue(FilledVariabilityMetric, answeredSurvey.FileId,
            new
            {
                WasFilledFlatList = questionFlatList.Select(t => t.QuestionAnswer != null),
                QuestionFlatList = questionFlatList,
            });
        metricsService.SaveMetricValue(GenerationCountMetric, answeredSurvey.FileId, new { Value = 1 });
    }

    private static List<ResponseDto.AnsweredQuestion> GetAnsweredQuestionFlatList(
        ResponseDto.AnsweredQuestion answeredQuestion)
    {
        var questionFlatList = new List<ResponseDto.AnsweredQuestion> { answeredQuestion };

        foreach (var (_, subQuestions) in answeredQuestion.SubQuestionsByAnswer)
        foreach (var subQuestion in subQuestions)
            questionFlatList.AddRange(GetAnsweredQuestionFlatList(subQuestion));
        return questionFlatList;
    }
}