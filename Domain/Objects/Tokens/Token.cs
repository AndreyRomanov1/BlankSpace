using Xceed.Document.NET;

namespace Domain.Objects.Tokens;

public abstract class Token(Paragraph paragraph, int startIndex, int endIndex, string text, string questionText)
{
    public Paragraph Paragraph { get; } = paragraph;
    public int StartIndex { get; } = startIndex;
    public int EndIndex { get; } = endIndex;
    public string Text { get; } = text;
    public string QuestionText { get; } = questionText;

    public abstract TokenType GetTokenType();
}