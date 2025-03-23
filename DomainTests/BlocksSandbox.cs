using Domain.Services.Implementation;
using Xceed.Words.NET;
using Xunit.Abstractions;

namespace DomainTests;

public class BlocksSandbox(ITestOutputHelper testOutputHelper)
{
    [Theory]
    [InlineData("test_doc_1.docx")]
    [InlineData("test_doc_2.docx")]
    [InlineData("test_doc_3.docx")]
    [InlineData("test_doc_4.docx")]
    public void GetBlocks(string filePath)
    {
        var tokenParsingService = GetTokenParsingService();
        var blocksService = new BlocksService();
        using var doc = DocX.Load(filePath);
        var tokens = tokenParsingService.FindTokens(doc);
        var blocks = blocksService.GroupTokensToBlocks(tokens);
        testOutputHelper.WriteLine(string.Join("\n", blocks.Select(t => t.ToString())));
    }

    private static TokenParsingService GetTokenParsingService()
    {
        var tokenFactory = new TokenFactory();
        var service = new TokenParsingService(tokenFactory);
        return service;
    }
}