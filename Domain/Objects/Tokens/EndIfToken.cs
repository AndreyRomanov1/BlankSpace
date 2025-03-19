using Xceed.Document.NET;

namespace Domain.Objects.Tokens;

public class EndIfToken(Paragraph paragraph, int startIndex, int endIndex, string text)
    : Token(paragraph, startIndex, endIndex, text)
{
    public override TokenType GetTokenType() => TokenType.EndIf;

    public static string GetPattern()
    {
        return @"\{КОНЕЦ\s+ЕСЛИ\}";
    }
}