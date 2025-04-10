using Domain.Objects.Tokens;

namespace Domain.Objects.Blocks;

public class InputBlock(InputToken inputToken) : Block(inputToken)
{
    public InputToken InputToken { get; } = inputToken;

    public override BlockType GetBlockType()
    {
        return BlockType.InputBlock;
    }
}