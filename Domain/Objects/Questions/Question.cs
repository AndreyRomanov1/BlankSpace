namespace Domain.Objects.Questions;

public abstract class Question(string name)
{
    public string Name { get; } = name;
    public bool ActiveQuestion { get; set; } = false;
    public abstract QuestionType Type { get; }

    public abstract QuestionView GetView();
}