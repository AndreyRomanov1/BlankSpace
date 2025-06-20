using System.Text.RegularExpressions;
using Xceed.Document.NET;

namespace Domain.Objects.Tokens;

public partial class IfToken(Paragraph paragraph, int startIndex, int endIndex, string text)
    : Token(paragraph, startIndex, endIndex, text, ExtractQuestionText(text))
{
    public string AnswerText { get; } = ExtractAnswer(text);

    public override TokenType GetTokenType()
    {
        return TokenType.If;
    }

    private static string ExtractQuestionText(string text)
    {
        var match = MyRegex().Match(text);

        if (!match.Success)
            throw new Exception(
                $"Не удалось достать текст вопроса из условного блока. Блок: `{text}`. Проверьте корректность шаблона");

        var question = match.Groups[1].Value;
        return question;
    }

    private static string ExtractAnswer(string text)
    {
        var match = MyRegex().Match(text);

        if (!match.Success)
            throw new Exception(
                $"Не удалось достать текст ответа из условного блока. Блок: `{text}`. Проверьте корректность шаблона");

        var answer = match.Groups[2].Value;
        return answer;
    }

    [GeneratedRegex(@"\{\s*ЕСЛИ\s*\(([^)]+)\)\s*\(([^)]+)\)\s*\}", RegexOptions.IgnoreCase)]
    public static partial Regex MyRegex();
}