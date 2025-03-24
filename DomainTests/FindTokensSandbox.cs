using Domain.Objects.Tokens;
<<<<<<< HEAD
using Domain.Services.Implementations;
=======
using Domain.Services.Implementation;
>>>>>>> 2e8e1d9 (добавил в токены возможность вытащить текст самого вопроса, для опроса)
using Xceed.Document.NET;
using Xceed.Words.NET;
using Xunit.Abstractions;

namespace DomainTests;

public class FindTokensSandbox(ITestOutputHelper testOutputHelper)
{
    [Theory]
    [InlineData("test_doc_1.docx")]
    [InlineData("test_doc_2.docx")]
    [InlineData("test_doc_3.docx")]
    [InlineData("test_doc_4.docx")]
    public void FindTokens(string filePath)
    {
        var service = GetTokenParsingService();
        using var doc = DocX.Load(filePath);
        var tokens = service.FindTokens(doc);

        foreach (var token in tokens)
        {
            testOutputHelper.WriteLine($"Тип: {token.GetTokenType()}");
            testOutputHelper.WriteLine($"Текст: {token.Text}");
            testOutputHelper.WriteLine($"Текущий Параграф: {token.Paragraph.Text}");
            testOutputHelper.WriteLine($"Стартовый индекс параграфа: {token.Paragraph.StartIndex}");
            testOutputHelper.WriteLine($"Конечный индекс параграфа: {token.Paragraph.EndIndex}");
            testOutputHelper.WriteLine($"Параграф (класс): {token.Paragraph}");
            testOutputHelper.WriteLine($"Предыдущий параграф: {token.Paragraph.PreviousParagraph?.Text}");
            testOutputHelper.WriteLine($"Следующий параграф: {token.Paragraph.NextParagraph?.Text}");
            testOutputHelper.WriteLine($"Начальный индекс: {token.StartIndex}, Конечный индекс: {token.EndIndex}");
            testOutputHelper.WriteLine($"Вопрос: <{token.QuestionText}>");
            if (token is IfToken ifToken)
                testOutputHelper.WriteLine($"Ответ: <{ifToken.AnswerText}>");
            testOutputHelper.WriteLine("");
        }

        testOutputHelper.WriteLine("----------------------------");
        foreach (var token in tokens)
        {
            token.Paragraph.ReplaceText(
                new StringReplaceTextOptions
                {
                    SearchValue = token.Text,
                    NewValue = ""
                });
            testOutputHelper.WriteLine($"Тип: {token.GetTokenType()}");
            testOutputHelper.WriteLine($"Текст: {token.Text}");
            testOutputHelper.WriteLine($"Текущий Параграф: {token.Paragraph.Text}");
            testOutputHelper.WriteLine($"Стартовый индекс параграфа: {token.Paragraph.StartIndex}");
            testOutputHelper.WriteLine($"Конечный индекс параграфа: {token.Paragraph.EndIndex}");
            testOutputHelper.WriteLine($"Параграф (класс): {token.Paragraph}");
            testOutputHelper.WriteLine($"Предыдущий параграф: {token.Paragraph.PreviousParagraph?.Text}");
            testOutputHelper.WriteLine($"Следующий параграф: {token.Paragraph.NextParagraph?.Text}");
            testOutputHelper.WriteLine($"Начальный индекс: {token.StartIndex}, Конечный индекс: {token.EndIndex}");
            testOutputHelper.WriteLine($"Вопрос: <{token.QuestionText}>");
            if (token is IfToken ifToken)
                testOutputHelper.WriteLine($"Ответ: <{ifToken.AnswerText}>");
            testOutputHelper.WriteLine("");
        }
    }

    private static TokenParsingService GetTokenParsingService()
    {
        var tokenFactory = new TokenFactory();
        var service = new TokenParsingService(tokenFactory);
        return service;
    }
}