<<<<<<< HEAD
using Domain.Objects.Blocks;

namespace Domain.Objects.Questions;

public class IfQuestion(string name) : Question(name)
{
    public override QuestionType Type => QuestionType.IfQuestion;

    public override QuestionView GetView()
    {
        return new QuestionView(
            Name,
            Answers.ToDictionary(
                t => t.Key,
                t => t.Value.SubQuestions.Select(t2 => t2.GetView()).ToArray()),
            QuestionType.IfQuestion);
    }

    public Dictionary<string, IfAnswer> Answers { get; } = new();
}

public class IfAnswer(string answer)
{
    public string Answer { get; } = answer;
    public Question[] SubQuestions { get; set; }
    public List<IfBlock> Blocks { get; } = [];
=======
namespace Domain.Objects.Questions;

public class IfQuestion : Question
{
>>>>>>> 2e8e1d9 (добавил в токены возможность вытащить текст самого вопроса, для опроса)
}