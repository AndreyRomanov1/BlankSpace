namespace Web.Dto.Response;

public record Question(
    QuestionType questionType,
    string Name,
    Dictionary<string, Question[]> SubQuestionsByAnswer);