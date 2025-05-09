using System.Text.RegularExpressions;
using Xceed.Document.NET;

namespace Domain.Objects.Tokens;

public partial class EndIfToken(Paragraph paragraph, int startIndex, int endIndex, string text)
    : Token(paragraph, startIndex, endIndex, text, "")
{
    public override TokenType GetTokenType()
    {
        return TokenType.EndIf;
    }

    [GeneratedRegex(@"\{\s*КОНЕЦ\s*ЕСЛИ\s*\}", RegexOptions.IgnoreCase)]
    public static partial Regex MyRegex();
}