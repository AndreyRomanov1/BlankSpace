using Domain.Objects.Tokens;

namespace Domain.Objects.Blocks;

public abstract class Block(Token mainToken, Block? parentBlock)
{
    public Token MainToken { get; } = mainToken;
    public Block? ParentBlock { get; } = parentBlock;

    public abstract BlockType GetBlockType();
    public override string ToString() => $"{GetBlockType()}_{MainToken.Text}";
}