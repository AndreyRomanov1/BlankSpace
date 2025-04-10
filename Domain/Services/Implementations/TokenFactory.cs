using System.Text.RegularExpressions;
using Domain.Objects.Tokens;
using Domain.Services.Interfaces;
using Xceed.Document.NET;

namespace Domain.Services.Implementations;

public class TokenFactory : ITokenFactory
{
    private readonly Dictionary<TokenType, Regex> tokens = new()
    {
        [TokenType.If] = IfToken.MyRegex(),
        [TokenType.EndIf] = EndIfToken.MyRegex(),
        [TokenType.Input] = InputToken.MyRegex()
    };

    public Token CreateToken(TokenType tokenType, Paragraph paragraph, int startIndex, int endIndex, string text)
    {
        return tokenType switch
        {
            TokenType.If => new IfToken(paragraph, startIndex, endIndex, text),
            TokenType.EndIf => new EndIfToken(paragraph, startIndex, endIndex, text),
            TokenType.Input => new InputToken(paragraph, startIndex, endIndex, text),
            _ => throw new ArgumentOutOfRangeException(nameof(tokenType), tokenType, null)
        };
    }

    public (TokenType TokenType, Regex TokenRegex)[] GetSupportedTokens()
    {
        return tokens.Select(t => (t.Key, t.Value)).ToArray();
    }
}