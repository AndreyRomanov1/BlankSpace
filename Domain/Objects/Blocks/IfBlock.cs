using Domain.Objects.Tokens;

namespace Domain.Objects.Blocks;

public class IfBlock(
    IfToken ifToken,
    EndIfToken endIfToken,
    Block? parentBlock,
    Block[] childBlocks)
    : Block(ifToken, parentBlock)
{
    public EndIfToken EndIfToken { get; } = endIfToken;
    public Block[] ChildBlocks { get; } = childBlocks;

    public override BlockType GetBlockType() => BlockType.IfBlock;

    public override string ToString() =>
        $"{base.ToString()}_<{string.Join("\n", ChildBlocks.Select(t => t.ToString()))}>";
}