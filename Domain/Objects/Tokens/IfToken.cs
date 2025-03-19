using Xceed.Document.NET;

namespace Domain.Objects.Tokens;

public class IfToken(Paragraph paragraph, int startIndex, int endIndex, string text)
    : Token(paragraph, startIndex, endIndex, text)
{
    public override TokenType GetTokenType() => TokenType.If;

    public static string GetPattern() => @"\{ЕСЛИ\s+\([^\)]+\)\s+\([^\)]+\)\}";
}