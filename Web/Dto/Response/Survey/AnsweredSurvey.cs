namespace Web.Dto.Response;

public record AnsweredSurvey(Guid FileId, AnsweredQuestion[] AnsweredQuestions);