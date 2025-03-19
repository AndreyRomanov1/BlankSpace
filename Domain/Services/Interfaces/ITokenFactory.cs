using Domain.Objects.Tokens;
using Xceed.Document.NET;

namespace Domain.Services.Interfaces;

public interface ITokenFactory
{
    public Token CreateToken(TokenType tokenType, Paragraph paragraph, int startIndex, int endIndex, string text);
    public (TokenType TokenType, string TokenRegex)[] GetSupportedTokens();
}