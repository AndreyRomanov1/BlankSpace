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

        Fill(survey.Questions);

        var resultStream = new MemoryStream();
        doc.SaveAs(resultStream);
        var resultContentFile = file with { Stream = resultStream };
        var resultFileId =
            fileStorageRepository.AddFile(resultContentFile, TimeSpan.FromDays(12));

        return resultFileId;
    }

    private void Fill(Question[] questions)
    {
        foreach (var question in questions)
        {
            Fill(question);
        }
    }

    private void Fill(Question question)
    {
        switch (question)
        {
            case IfQuestion ifQuestion:
            {
                // TODO дописать логику
                break;
            }
            case InputQuestion inputQuestion:
            {
                Console.WriteLine();
                Console.WriteLine();
                Console.WriteLine(inputQuestion.Name);
                Console.WriteLine();
                foreach (var block in inputQuestion.Blocks)
                {
                    var inputToken = block.InputToken;
                    Console.WriteLine(inputToken.Paragraph.Text);
                    Console.WriteLine(inputToken.Paragraph.Text.Substring(
                        inputToken.StartIndex,
                        inputToken.EndIndex - inputToken.StartIndex));
                    block.InputToken.Paragraph.RemoveText(
                        inputToken.StartIndex,
                        inputToken.EndIndex - inputToken.StartIndex);
                    block.InputToken.Paragraph.InsertText(inputQuestion.EnteredValue);
                    Console.WriteLine(inputToken.Paragraph.Text);
                    Console.WriteLine();
                }

                break;
            }
            default:
                throw new BadRequestException("Такой тип вопроса не поддерживается");
        }
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
                        ifQuestion.ActiveQuestion = true;
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
                    {
                        if (enteredValue != null)
                            throw new BadRequestException(
                                $"Если подвопрос {inputQuestion.Name} не выбран в родителе, то ответ должен быть null. Получено: <{enteredValue}>");
                    }
                    else
                    {
                        inputQuestion.ActiveQuestion = true;
                        inputQuestion.EnteredValue = enteredValue;
                    }

                    break;
                }
                default:
                    throw new BadRequestException("Такой тип вопроса не поддерживается");
            }
        }
    }
}