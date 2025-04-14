using Domain.Exceptions;
using Domain.Objects.Blocks;
using Domain.Objects.Questions;
using Domain.Objects.Storage;
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

        Console.WriteLine($"Документ в итоге: {doc.Paragraphs.Count} параграфов");
        var resultStream = new MemoryStream();
        doc.SaveAs(resultStream);
        Console.WriteLine($"Документ в итоге: {resultStream.Length} длина");

        var resultContentFile = new ContentFile(file.Name, resultStream);
        resultStream.Position = 0;
        var resultFileId =
            fileStorageRepository.AddFile(resultContentFile, TimeSpan.FromDays(12));

        return resultFileId;
    }

    private static void Fill(Question[] questions)
    {
        foreach (var question in questions)
        {
            try
            {
                Fill(question);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Ошибка в обработке одного из вопросов: {e}");
            }
        }
    }

    private static void Fill(Question question)
    {
        switch (question)
        {
            case IfQuestion ifQuestion:
            {
                var selectedAnswer = ifQuestion.SelectedAnswer;
                Console.WriteLine($"Обработка выбранного ответа {selectedAnswer!.Answer}");
                foreach (var block in selectedAnswer!.Blocks)
                {
                    block.IfToken.ReplaceTokenValue("");
                    block.EndIfToken.ReplaceTokenValue("");
                }

                Console.WriteLine($"Обработка не выбранных ответов");
                foreach (var (answerName, answer) in ifQuestion.Answers
                             .Where(t => t.Key != ifQuestion.SelectedAnswer!.Answer))
                {
                    Console.WriteLine($"Обработка не выбранного ответа: {answerName}");
                    foreach (var block in answer!.Blocks)
                    {
                        var currentParagraph = block.IfToken.Paragraph;
                        var startIndex = block.IfToken.StartIndex;
                        Console.WriteLine("start counter");

                        var counter = 0;
                        while (currentParagraph != null && currentParagraph != block.EndIfToken.Paragraph)
                        {
                            Console.WriteLine(currentParagraph.Text + "  " + startIndex);
                            currentParagraph.RemoveText(startIndex);
                            Console.WriteLine(currentParagraph.Text);
                            startIndex = 0;
                            var next = currentParagraph.NextParagraph;
                            if (currentParagraph.Text.Trim().Length == 0)
                                currentParagraph.Remove(true);
                            currentParagraph = next;
                            counter++;
                            Console.WriteLine(counter);
                        }

                        Console.WriteLine("end counter");
                        currentParagraph?.RemoveText(startIndex, block.EndIfToken.EndIndex - startIndex + 1);
                    }
                    Console.WriteLine($"Конец обработки не выбранного ответа: {answerName}");

                }

                Console.WriteLine($"Заполняем подвопросы для {selectedAnswer.Answer}. Их {selectedAnswer.SubQuestions.Length} штук");
                Fill(selectedAnswer.SubQuestions);
                Console.WriteLine($"Конец подвопросов для {selectedAnswer.Answer}");
                break;
            }
            case InputQuestion inputQuestion:
            {
                Console.WriteLine($"Поле ввода {inputQuestion.Name}: {inputQuestion.EnteredValue}");
                foreach (var block in inputQuestion.Blocks)
                {
                    Console.WriteLine(block.InputToken.Paragraph.PreviousParagraph?.Text);
                    Console.WriteLine(block.InputToken.Paragraph.Text);
                    block.InputToken.ReplaceTokenValue(inputQuestion.EnteredValue!);
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