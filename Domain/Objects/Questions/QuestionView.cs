namespace Domain.Objects.Questions;

public class QuestionView(
    string name,
    Dictionary<string, QuestionView[]> subQuestionByAnswer,
    QuestionType questionType)
{
    public string Name { get; } = name;
    public Dictionary<string, QuestionView[]> SubQuestionByAnswer { get; } = subQuestionByAnswer;
    public QuestionType QuestionType { get; } = questionType;

    public override string ToString()
    {
        return
            $"Question {QuestionType} <{Name}>. " +
            $"Answers: <\n{string.Join(
                ", \n",
                SubQuestionByAnswer.Select(
                    t => $"{t.Key}: [\n{string.Join(
                        ",\n",
                        t.Value.Select(t2 => t2.ToString()).ToArray())}]"))}>;";
    }
}