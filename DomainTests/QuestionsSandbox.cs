using Domain.Services.Implementation;
using Xceed.Words.NET;
using Xunit.Abstractions;

namespace DomainTests;

public class QuestionsSandbox(ITestOutputHelper testOutputHelper)
{
[Theory]
[InlineData("test_doc_1.docx")]
[InlineData("test_doc_2.docx")]
[InlineData("test_doc_3.docx")]
[InlineData("test_doc_4.docx")]
[InlineData("test_doc_5.docx")]
public void GetQuestions(string filePath)
{
    var tokenParsingService = GetTokenParsingService();
    var blocksService = new BlocksService();
    var questionService = new QuestionService();
    using var doc = DocX.Load(filePath);
    var tokens = tokenParsingService.FindTokens(doc);
    var blocks = blocksService.GroupTokensToBlocks(tokens);
    var questions = questionService.GetQuestions(blocks);
    testOutputHelper.WriteLine(string.Join("\n", questions.Select(t => t.GetView().ToString())));
}

private static TokenParsingService GetTokenParsingService()
{
    var tokenFactory = new TokenFactory();
    var service = new TokenParsingService(tokenFactory);
    return service;
}
}