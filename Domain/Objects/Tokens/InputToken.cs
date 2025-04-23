using System.Text.RegularExpressions;
using Xceed.Document.NET;

namespace Domain.Objects.Tokens;

public partial class InputToken(Paragraph paragraph, int startIndex, int endIndex, string text)
    : Token(paragraph, startIndex, endIndex, text, ExtractQuestionText(text))
{
    public override TokenType GetTokenType()
    {
        return TokenType.Input;
    }

    private static string ExtractQuestionText(string text)
    {
        var match = MyRegex().Match(text);

        if (!match.Success)
            throw new Exception("Не удалось достать вопрос из условия");

        var question = match.Groups[1].Value;
        return question;
    }

    [GeneratedRegex(@"\{\s*ВВОД\s*\(([^)]+)\)\s*\}", RegexOptions.IgnoreCase)]
    public static partial Regex MyRegex();
}