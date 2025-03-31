using System.Text.RegularExpressions;
using Xceed.Document.NET;

namespace Domain.Objects.Tokens;

public partial class EndIfToken(Paragraph paragraph, int startIndex, int endIndex, string text)
    : Token(paragraph, startIndex, endIndex, text, "")
{
    public override TokenType GetTokenType() => TokenType.EndIf;

    [GeneratedRegex(@"\{КОНЕЦ\s+ЕСЛИ\}", RegexOptions.IgnoreCase)]
    public static partial Regex MyRegex();
}