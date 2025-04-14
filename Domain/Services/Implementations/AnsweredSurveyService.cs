using Domain.Exceptions;
using Domain.Objects.Questions;
using Domain.Objects.Survey;
using Domain.Repositories.Interfaces;
using Domain.Services.Interfaces;
using Xceed.Words.NET;

namespace Domain.Services.Implementations;

public class AnsweredSurveyService(
    IFileStorageRepository fileStorageRepository,
    ITokenParsingService tokenParsingService,
    IBlocksService blocksService,
    IQuestionService questionService) : IAnsweredSurveyService
{
    public Guid FillDocByAnsweredSurvey(Guid fileId, AnsweredSurvey answeredSurvey)
    {
        var file = fileStorageRepository.GetFile(fileId);
        var doc = DocX.Load(file.Stream);
        var tokens = tokenParsingService.FindTokens(doc);
        var blocks = blocksService.GroupTokensToBlocks(tokens);
        var survey = questionService.GetSurvey(blocks);
        MergeQuestionListWithAnsweredQuestionList(survey.Questions, answeredSurvey.AnsweredQuestions, true);

        // TODO Логику дописать!
        return fileId;
    }

    private void MergeQuestionListWithAnsweredQuestionList(
        Question[] questions,
        AnsweredQuestionView[] answeredQuestionsViews,
        bool isActiveQuestions)
    {
        if (questions.Length != answeredQuestionsViews.Length)
            throw new BadRequestException(
                "Количество вопросов в сохранённом документе и полученных ответах отличается");

        for (var i = 0; i < questions.Length; i++)
        {
            var question = questions[i];
            var questionView = question.GetView();
            var answeredQuestionView = answeredQuestionsViews[i];
            var questionAnsAnswerIsEqual = answeredQuestionView.CompareQuestionAndAnswer(questionView);
            if (!questionAnsAnswerIsEqual)
                throw new BadRequestException(
                    $"Вопрос и его ответ не совпадают: {questionView.Name} и {questionView.QuestionType}");
            switch (question)
            {
                case IfQuestion ifQuestion:
                {
                    var selectedAnswer = answeredQuestionView.QuestionAnswer;
                    if (!isActiveQuestions)
                    {
                        if (selectedAnswer != null)
                            throw new BadRequestException(
                                $"Если подвопрос {ifQuestion.Name} не выбран в родителе, то ответ должен быть null. Получено: <{selectedAnswer}>");
                    }
                    else
                    {
                        if (selectedAnswer == null)
                            throw new BadRequestException(
                                $"Если подвопрос {ifQuestion.Name} выбран в родителе, то ответ  не должен быть null. Получено: <{selectedAnswer}>");

                        if (!ifQuestion.Answers.TryGetValue(selectedAnswer, out var answer))
                            throw new BadRequestException(
                                $"Нет такого варианта ответа ответа на вопрос <{ifQuestion.Name}>. Получено: <{selectedAnswer}>");
                        ifQuestion.SelectedAnswer = answer;
                        MergeQuestionListWithAnsweredQuestionList(
                            answer.SubQuestions,
                            answeredQuestionView.SubQuestionByAnswer[selectedAnswer],
                            isActiveQuestions);
                    }

                    foreach (var (answerName, answer) in ifQuestion.Answers.Where(
                                 a => ifQuestion.SelectedAnswer != a.Value))
                        MergeQuestionListWithAnsweredQuestionList(
                            answer.SubQuestions,
                            answeredQuestionView.SubQuestionByAnswer[answerName],
                            false);

                    break;
                }
                case InputQuestion inputQuestion:
                {
                    var enteredValue = answeredQuestionView.QuestionAnswer;
                    if (!isActiveQuestions)
                        if (enteredValue != null)
                            throw new BadRequestException(
                                $"Если подвопрос {inputQuestion.Name} не выбран в родителе, то ответ должен быть null. Получено: <{enteredValue}>");

                    inputQuestion.EnteredValue = enteredValue;
                    break;
                }
                default:
                    throw new BadRequestException("Такой тип вопроса не поддерживается");
            }
        }
    }
}