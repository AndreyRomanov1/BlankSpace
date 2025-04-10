using Domain.Objects.Blocks;

namespace Domain.Objects.Questions;

public abstract class Question(string name)
{
    private readonly List<Block> blockList = [];
    public string Name { get; } = name;
    public abstract QuestionType Type { get; }
    public Block[] Blocks => blockList.ToArray();

    public abstract QuestionView GetView();

    public void AddBlock(Block block)
    {
        blockList.Add(block);
    }
}