using Domain.Objects.Tokens;

namespace Domain.Objects.Blocks;

public class InputBlock(
    InputToken inputToken) : Block(inputToken)
{
    public override BlockType GetBlockType() => BlockType.InputBlock;
}