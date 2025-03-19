using Domain.Objects.Tokens;
using Domain.Services.Interfaces;
using Xceed.Document.NET;

namespace Domain.Services.Implementation;

public class TokenFactory : ITokenFactory
{
    private readonly Dictionary<TokenType, string> tokens = new()
    {
        [TokenType.If] = IfToken.GetPattern(),
        [TokenType.EndIf] = EndIfToken.GetPattern(),
        [TokenType.Input] = InputToken.GetPattern(),
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

    public (TokenType TokenType, string TokenRegex)[] GetSupportedTokens()
    {
        return tokens.Select(t => (t.Key, t.Value)).ToArray();
    }
}