using Xceed.Document.NET;

namespace Domain.Objects.Tokens;

public abstract class Token(Paragraph paragraph, int startIndex, int endIndex, string text, string questionText)
{
    public Paragraph Paragraph { get; } = paragraph;
    public int StartIndex { get; set; } = startIndex;
    public int EndIndex { get; set; } = endIndex;
    public string Text { get; } = text;
    public string QuestionText { get; } = questionText;

    public abstract TokenType GetTokenType();

    public void ReplaceTokenValue(string insertedText, Dictionary<Paragraph, List<Token>> tokensByParagraph)
    {
        Console.WriteLine($"{nameof(ReplaceTokenValue)}: {Text}");

        var initEnd = EndIndex;
        if (Paragraph.Text.Length < EndIndex)
        {
            Console.WriteLine(
                $"ERROR: Параграф имеет меньшую длину, чем конец токена. {StartIndex} {EndIndex} {Paragraph.Text.Length} {Paragraph.Text}");
            return;

        }

        Paragraph.RemoveText(StartIndex, EndIndex - StartIndex, false, false);
        Paragraph.InsertText(StartIndex, insertedText, false);
        EndIndex = StartIndex + insertedText.Length;

        var deltaIndex = EndIndex - initEnd;
        foreach (var token in tokensByParagraph[Paragraph]
                     .Where(token => token.StartIndex >= StartIndex && token != this))
        {
            token.StartIndex += deltaIndex;
            token.EndIndex += deltaIndex;
        }
    }

    public void ClearTokenValue(Dictionary<Paragraph, List<Token>> tokensByParagraph)
    {
        Console.WriteLine($"{nameof(ClearTokenValue)}: {Text}");

        var initEnd = EndIndex;

        if (Paragraph.Text.Length < EndIndex)
        {
            Console.WriteLine(
                $"ERROR: Параграф имеет меньшую длину, чем конец токена. {StartIndex} {EndIndex} {Paragraph.Text.Length} {Paragraph.Text}");
            return;
        }

        Paragraph.RemoveText(StartIndex, EndIndex - StartIndex, false, false);
        EndIndex = StartIndex;

        var deltaIndex = EndIndex - initEnd;
        foreach (var token in tokensByParagraph[Paragraph]
                     .Where(token => token.StartIndex >= StartIndex && token != this))
        {
            token.StartIndex += deltaIndex;
            token.EndIndex += deltaIndex;
        }
    }

    public void ClearAfterToken(Dictionary<Paragraph, List<Token>> tokensByParagraph)
    {
        Console.WriteLine($"{nameof(ClearAfterToken)}: {Text}");

        if (Paragraph.Text.Length < EndIndex)
        {
            Console.WriteLine(
                $"ERROR: Параграф имеет меньшую длину, чем конец токена. {StartIndex} {EndIndex} {Paragraph.Text.Length} {Paragraph.Text}");
            return;
        }

        Paragraph.RemoveText(StartIndex, Paragraph.Text.Length - StartIndex, false, false);
        EndIndex = StartIndex;
    }

    public void ClearBeforeToken(Dictionary<Paragraph, List<Token>> tokensByParagraph)
    {
        Console.WriteLine($"{nameof(ClearBeforeToken)}: {Text}");

        var initEnd = EndIndex;

        if (Paragraph.Text.Length < EndIndex)
        {
            Console.WriteLine(
                $"ERROR: Параграф имеет меньшую длину, чем конец токена. {StartIndex} {EndIndex} {Paragraph.Text.Length} {Paragraph.Text}");
            return;
        }

        Paragraph.RemoveText(0, EndIndex, false, false);
        StartIndex = 0;
        EndIndex = 0;
        foreach (var token in tokensByParagraph[Paragraph]
                     .Where(token => token.StartIndex >= StartIndex && token != this))
        {
            token.StartIndex -= initEnd;
            token.EndIndex -= initEnd;
        }
    }
}