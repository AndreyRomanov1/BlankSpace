namespace Web.Dto.Response;

public record Question(
    QuestionType QuestionType,
    string Name,
    Dictionary<string, Question[]> SubQuestionsByAnswer);