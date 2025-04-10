using Domain.Exceptions;
using Domain.Repositories.Interfaces;
using Domain.Services.Interfaces;
using Web.Dto.Response;
using Web.MappingExtensions.Survey;
using Web.Services.Interfaces;
using Xceed.Words.NET;

namespace Web.Services.Implementations;

public class SurveyService(
    ITokenParsingService tokenParsingService,
    IBlocksService blocksService,
    IQuestionService questionService,
    IFileStorageRepository fileStorageRepository
) : ISurveyService
{
    public Survey GetSurveyByDocx(Guid fileId)
    {
        var contentFile = fileStorageRepository.GetFile(fileId);
        if (!Path.GetExtension(contentFile.Name).Equals(".docx", StringComparison.CurrentCultureIgnoreCase))
            throw new BadRequestException("Invalid file format. Only DOCX allowed");
        using var doc = DocX.Load(contentFile.Stream);
        var tokens = tokenParsingService.FindTokens(doc);
        var blocks = blocksService.GroupTokensToBlocks(tokens);
        var questions = questionService.GetQuestions(blocks);
        return questions.ToResponse();
    }
}