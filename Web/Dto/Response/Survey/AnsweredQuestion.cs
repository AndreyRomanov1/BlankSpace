namespace Web.Dto.Response;

public record AnsweredQuestion(
    QuestionType QuestionType,
    string Name,
    Dictionary<string, AnsweredQuestion[]> SubQuestionsByAnswer,
    string? QuestionAnswer
);