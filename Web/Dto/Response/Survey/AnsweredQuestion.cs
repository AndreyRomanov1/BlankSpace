namespace Web.Dto.Response;

public record AnsweredQuestion(
    QuestionType questionType,
    string Name,
    Dictionary<string, AnsweredQuestion[]> SubQuestionsByAnswer,
    string QuestionAnswer
);