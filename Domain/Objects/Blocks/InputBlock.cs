    InputToken inputToken,
using Domain.Objects.Tokens;

namespace Domain.Objects.Blocks;

public class InputBlock(InputToken inputToken) : Block(inputToken)
{
<<<<<<< HEAD
    public InputToken InputToken { get; } = inputToken;
    public override BlockType GetBlockType() => BlockType.InputBlock;
=======
    public override BlockType GetBlockType()
    {
        return BlockType.InputBlock;
    }
>>>>>>> 2e8e1d9 (добавил в токены возможность вытащить текст самого вопроса, для опроса)
}