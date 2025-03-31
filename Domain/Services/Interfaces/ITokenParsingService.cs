using Domain.Objects.Tokens;
using Xceed.Words.NET;

namespace Domain.Services.Interfaces;

public interface ITokenParsingService
{
    public Token[] FindTokens(DocX document);
}