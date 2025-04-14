using Domain.Objects.Questions;

namespace Domain.Objects.Survey;

public record AnsweredSurvey(AnsweredQuestionView[] AnsweredQuestions);