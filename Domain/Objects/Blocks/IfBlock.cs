using Domain.Objects.Tokens;
using Xceed.Document.NET;

namespace Domain.Objects.Blocks;

public class IfBlock(
    IfToken ifToken,
    EndIfToken endIfToken,
    Block[] childBlocks)
    : Block(ifToken)
{
    public IfToken IfToken { get; } = ifToken;
    public EndIfToken EndIfToken { get; } = endIfToken;
    public Block[] ChildBlocks { get; } = childBlocks;

    public override BlockType GetBlockType()
    {
        return BlockType.IfBlock;
    }

    public override string ToString()
    {
        return $"{base.ToString()}_<{string.Join(",  ", ChildBlocks.Select(t => t.ToString()))}>";
    }

    public void ClearUnselectedIfBlock(Dictionary<Paragraph, List<Token>> tokensByParagraph)
    {
        if (IfToken.Paragraph == EndIfToken.Paragraph)
            ClearUnselectedIfBlockInSingleParagraph(tokensByParagraph);
        else
            ClearUnselectedIfBlockInFewParagraph(tokensByParagraph);
    }

    private void ClearUnselectedIfBlockInFewParagraph(Dictionary<Paragraph, List<Token>> tokensByParagraph)
    {
        Console.WriteLine($"{nameof(ClearUnselectedIfBlockInFewParagraph)}: {IfToken.Text}...{EndIfToken.Text}");

        IfToken.ClearAfterToken(tokensByParagraph);
        var currentParagraph = IfToken.Paragraph.NextParagraph;
        while (currentParagraph != EndIfToken.Paragraph)
        {
            currentParagraph.RemoveText(0, currentParagraph.Text.Length, false, false);
            tokensByParagraph.TryAdd(currentParagraph, []);
            currentParagraph = currentParagraph.NextParagraph;
        }

        EndIfToken.ClearBeforeToken(tokensByParagraph);
    }

    private void ClearUnselectedIfBlockInSingleParagraph(Dictionary<Paragraph, List<Token>> tokensByParagraph)
    {
        Console.WriteLine($"{nameof(ClearUnselectedIfBlockInSingleParagraph)}: {IfToken.Text}");
        var initEnd = EndIfToken.EndIndex;
        if (EndIfToken.Paragraph.Text.Length < EndIfToken.EndIndex)
        {
            Console.WriteLine(
                $"ERROR: Параграф имеет меньшую длину, чем конец токена. {IfToken.StartIndex} {EndIfToken.EndIndex} {EndIfToken.Paragraph.Text.Length}  {EndIfToken.Paragraph.Text}");
            return;
        }

        EndIfToken.Paragraph.RemoveText(
            IfToken.StartIndex,
            EndIfToken.EndIndex - IfToken.StartIndex,
            false,
            false);
        IfToken.EndIndex = IfToken.StartIndex;
        EndIfToken.StartIndex = IfToken.StartIndex;
        EndIfToken.EndIndex = IfToken.StartIndex;

        var deltaIndex = EndIfToken.EndIndex - initEnd;
        foreach (var token in tokensByParagraph[EndIfToken.Paragraph]
                     .Where(token =>
                         token.StartIndex >= EndIfToken.StartIndex
                         && token != EndIfToken))
        {
            token.StartIndex += deltaIndex;
            token.EndIndex += deltaIndex;
        }
    }
}