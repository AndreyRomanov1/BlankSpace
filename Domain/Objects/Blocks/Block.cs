using Domain.Objects.Tokens;

namespace Domain.Objects.Blocks;

public abstract class Block(Token mainToken)
{
    public Token MainToken { get; } = mainToken;
    public Block? ParentBlock { get; set; } = null;

    public abstract BlockType GetBlockType();
    public override string ToString() => $"{GetBlockType()}_{MainToken.Text}";
}