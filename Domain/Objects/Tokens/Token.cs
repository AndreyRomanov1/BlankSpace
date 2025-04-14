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

    public void ReplaceTokenValue(string insertedText)
    {
        Console.WriteLine($"{StartIndex} {EndIndex} {Paragraph.Text.Length} {insertedText}");

        if (Paragraph.Text.Length <= EndIndex - StartIndex + 1)
        {
            Paragraph.RemoveText(0);
            Paragraph.InsertText(0, insertedText);
            Console.WriteLine("заменил:   [" + Paragraph.Text + "]");
            if (Paragraph.Text.Trim().Length == 0)
            {
                Paragraph.Remove(true);
                Console.WriteLine("удалил маленький 1");
            }

            return;
        }

        try
        {
            Paragraph.RemoveText(StartIndex, EndIndex - StartIndex + 1);
            Paragraph.InsertText(StartIndex, insertedText);
            Console.WriteLine("заменил");
            if (Paragraph.Text.Trim().Length == 0)
            {
                Paragraph.Remove(true);
                Console.WriteLine("удалил маленький 2");
            }
        }
        catch (Exception e)
        {
            Console.WriteLine($"Ошибка во время удаление внутри токена: {e}");
        }
    }
}