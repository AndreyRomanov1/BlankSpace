namespace Domain.Objects.Questions;

public class AnsweredQuestionView(
    string name,
    Dictionary<string, AnsweredQuestionView[]> subQuestionByAnswer,
    QuestionType questionType,
    string? questionAnswer) : QuestionView(name, null, questionType)
{
    public string? QuestionAnswer { get; } = questionAnswer;
    public new Dictionary<string, AnsweredQuestionView[]> SubQuestionByAnswer { get; } = subQuestionByAnswer;

    public override string ToString()
    {
        return base.ToString() + $"\nQuestionAnswer: {QuestionAnswer}";
    }

    public bool CompareQuestionAndAnswer(QuestionView questionView)
    {
        return Name == questionView.Name
               && QuestionType == questionView.QuestionType
               && SubQuestionByAnswer.Count == questionView.SubQuestionByAnswer.Count
               && SubQuestionByAnswer.Keys.ToHashSet().SetEquals(questionView.SubQuestionByAnswer.Keys.ToHashSet());
    }
}