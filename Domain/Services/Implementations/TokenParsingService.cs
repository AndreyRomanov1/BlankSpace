using System.Text.RegularExpressions;
using Domain.Objects.Tokens;
using Domain.Services.Interfaces;
using Xceed.Words.NET;

namespace Domain.Services.Implementations;

public class TokenParsingService(ITokenFactory tokenFactory) : ITokenParsingService
{
    public Token[] FindTokens(DocX document)
    {
        var foundTokens = new List<Token>();
        var tokenTypes = tokenFactory.GetSupportedTokens();
        foreach (var paragraph in document.Paragraphs)
        {
            var paragraphText = paragraph.Text;
            var tokensInParagraph = new List<Token>();
            foreach (var (tokenType, tokenRegex) in tokenTypes)
            {
                var matches = tokenRegex.Matches(paragraphText);
                foreach (Match match in matches)
                {
                    var token = tokenFactory.CreateToken(
                        tokenType,
                        paragraph,
                        match.Index,
                        match.Index + match.Length,
                        match.Value);

                    tokensInParagraph.Add(token);
                }
            }
            foundTokens.AddRange(tokensInParagraph.OrderBy(t => t.StartIndex));
        }

        return foundTokens.ToArray();
    }
}