namespace Web.Dto.Response;

public record AnsweredSurvey(Guid fileId, AnsweredQuestion[] answeredQuestions);