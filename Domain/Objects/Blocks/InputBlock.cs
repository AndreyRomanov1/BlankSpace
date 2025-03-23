using Domain.Objects.Tokens;

namespace Domain.Objects.Blocks;

public class InputBlock(
    InputToken inputToken,
    Block? parentBlock) : Block(inputToken, parentBlock)
{
    public override BlockType GetBlockType() => BlockType.InputBlock;
}