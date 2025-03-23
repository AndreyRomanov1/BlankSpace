using Domain.Objects.Blocks;
using Domain.Objects.Tokens;
using Domain.Services.Interfaces;

namespace Domain.Services.Implementation;

public class BlocksService : IBlocksService
{
    public Block[] GroupTokensToBlocks(Token[] tokens)
    {
        var (blocks, endIndex) = GroupTokensToBlocksByRecursively(tokens);
        if (endIndex != null)
            throw new Exception("Условие не было завершено");

        return blocks;
    }

    private (Block[] blocks, int? endIndex) GroupTokensToBlocksByRecursively(Token[] tokens, int startIndex = 0)
    {
        var blockList = new List<Block>();
        if (startIndex >= tokens.Length)
            return ([], null);
        for (var i = startIndex; i < tokens.Length; i++)
        {
            var token = tokens[i];
            switch (token.GetTokenType())
            {
                case TokenType.If:
                {
                    var ifToken = (IfToken)token;
                    var (childBlocks, endIfIndex) = GroupTokensToBlocksByRecursively(tokens, i + 1);

                    if (endIfIndex == null)
                        throw new Exception("Условие не было завершено");

                    var endIfToken = (EndIfToken)tokens[endIfIndex.Value];
                    var ifBlock = new IfBlock(ifToken, endIfToken, childBlocks);
                    foreach (var childBlock in childBlocks)
                        childBlock.ParentBlock = ifBlock;
                    blockList.Add(ifBlock);
                    i = endIfIndex.Value;
                    break;
                }
                case TokenType.EndIf:
                    return (blockList.ToArray(), i);
                case TokenType.Input:
                {
                    var inputToken = (InputToken)token;
                    var inputBlock = new InputBlock(inputToken);
                    blockList.Add(inputBlock);
                    break;
                }
                default:
                    throw new ArgumentOutOfRangeException($"Токен {token.GetTokenType()} не поддерживается");
            }
        }

        return (blockList.ToArray(), null);
    }
}