using Xceed.Document.NET;

namespace Domain.Objects.Tokens;

public class InputToken(Paragraph paragraph, int startIndex, int endIndex, string text)
    : Token(paragraph, startIndex, endIndex, text)
{
    public override TokenType GetTokenType() => TokenType.Input;

    public static string GetPattern()
    {
        return @"\{ВВОД\s+\([^\)]+\)\}";
    }
}