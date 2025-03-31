using Domain.Objects.Blocks;
using Domain.Objects.Tokens;

namespace Domain.Services.Interfaces;

public interface IBlocksService
{
    public Block[] GroupTokensToBlocks(Token[] tokens);
}