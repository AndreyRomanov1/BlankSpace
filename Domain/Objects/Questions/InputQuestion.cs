using Domain.Objects.Blocks;

namespace Domain.Objects.Questions;

public class InputQuestion(string name) : Question(name)
{
    public override QuestionType Type => QuestionType.InputQuestion;
    public List<InputBlock> Blocks { get; } = [];

    public override QuestionView GetView()
    {
        return new QuestionView(Name, [], QuestionType.InputQuestion);
    }
}