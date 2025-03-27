using Domain.Services.Interfaces;
using Web.Dto.Response;
using Web.MappingExtensions.Survey;
using Web.Services.Interfaces;
using Xceed.Words.NET;

namespace Web.Services.Implementations;

public class SurveyService(
    ITokenParsingService tokenParsingService,
    IBlocksService blocksService,
    IQuestionService questionService
) : ISurveyService
{
    public Survey GetSurveyByDocx(Stream fileStream)
    {
        using var doc = DocX.Load(fileStream);
        var tokens = tokenParsingService.FindTokens(doc);
        var blocks = blocksService.GroupTokensToBlocks(tokens);
        var questions = questionService.GetQuestions(blocks);
        return questions.ToResponse();
    }
}