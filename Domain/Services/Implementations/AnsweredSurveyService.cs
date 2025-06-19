using Domain.Exceptions;
using Domain.Objects.Questions;
using Domain.Objects.Storage;
using Domain.Objects.Survey;
using Domain.Objects.Tokens;
using Domain.Repositories.Interfaces;
using Domain.Services.Interfaces;
using Xceed.Document.NET;
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
        var tokensByParagraph = new Dictionary<Paragraph, List<Token>>();
        foreach (var token in tokens)
        {
            tokensByParagraph.TryAdd(token.Paragraph, []);
            tokensByParagraph[token.Paragraph].Add(token);
        }

        var blocks = blocksService.GroupTokensToBlocks(tokens);
        var survey = questionService.GetSurvey(blocks);

        MergeQuestionListWithAnsweredQuestionList(survey.Questions, answeredSurvey.AnsweredQuestions, true);

        Fill(survey.Questions, tokensByParagraph);

        foreach (var paragraph in tokensByParagraph.Keys.ToHashSet())
            if (string.IsNullOrEmpty(paragraph.Text.Trim()))
                paragraph.Remove(false);

        Console.WriteLine($"Документ в итоге: {doc.Paragraphs.Count} параграфов");
        var resultStream = new MemoryStream();
        doc.SaveAs(resultStream);
        Console.WriteLine($"Документ в итоге: {resultStream.Length} длина");

        var resultContentFile = new ContentFile(file.Name, resultStream);
        resultStream.Position = 0;
        var resultFileId = fileStorageRepository.AddFile(resultContentFile, TimeSpan.FromDays(12));

        return resultFileId;
    }

    private static void Fill(Question[] questions, Dictionary<Paragraph, List<Token>> tokensByParagraph)
    {
        foreach (var question in questions)
        {
            try
            {
                Fill(question, tokensByParagraph);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Ошибка в обработке одного из вопросов: {e}");
            }
        }
    }

    private static void Fill(Question question, Dictionary<Paragraph, List<Token>> tokensByParagraph)
    {
        switch (question)
        {
            case IfQuestion ifQuestion:
            {
                var selectedAnswer = ifQuestion.SelectedAnswer;
                foreach (var block in selectedAnswer!.Blocks)
                {
                    block.IfToken.ClearTokenValue(tokensByParagraph);
                    block.EndIfToken.ClearTokenValue(tokensByParagraph);
                }

                foreach (var (_, answer) in ifQuestion.Answers.Where(t => t.Key != ifQuestion.SelectedAnswer!.Answer))
                foreach (var ifBlock in answer.Blocks)
                    ifBlock.ClearUnselectedIfBlock(tokensByParagraph);

                Fill(selectedAnswer.SubQuestions, tokensByParagraph);
                break;
            }
            case InputQuestion inputQuestion:
            {
                foreach (var block in inputQuestion.Blocks)
                    block.InputToken.ReplaceTokenValue(inputQuestion.EnteredValue!, tokensByParagraph);

                break;
            }
            default:
                throw new BadRequestException($"Такой тип вопроса не поддерживается: {question.Type.ToString()}");
        }
    }

    private void MergeQuestionListWithAnsweredQuestionList(
        Question[] questions,
        AnsweredQuestionView[] answeredQuestionsViews,
        bool isActiveQuestions)
    {
        if (questions.Length != answeredQuestionsViews.Length)
            throw new BadRequestException(
                $"Количество вопросов в сохранённом документе и полученных ответах отличается. Что-то пошло не так при заполнении опроса. Ожидалось {questions.Length}, а получено {answeredQuestionsViews.Length}");

        for (var i = 0; i < questions.Length; i++)
        {
            var question = questions[i];
            var questionView = question.GetView();
            var answeredQuestionView = answeredQuestionsViews[i];
            var questionAnsAnswerIsEqual = answeredQuestionView.CompareQuestionAndAnswer(questionView);
            if (!questionAnsAnswerIsEqual)
                throw new BadRequestException(
                    $"Вопрос в сохранённом документе и полученном ответе отличается: {questionView.Name} и {questionView.QuestionType}");
            switch (question)
            {
                case IfQuestion ifQuestion:
                {
                    var selectedAnswer = answeredQuestionView.QuestionAnswer;
                    if (!isActiveQuestions)
                    {
                        if (selectedAnswer != null)
                            throw new BadRequestException(
                                $"Если подвопрос {ifQuestion.Name} не выбран в родителе, то ответ должен быть null. Получено: `{selectedAnswer}`");
                    }
                    else
                    {
                        if (selectedAnswer == null)
                            throw new BadRequestException(
                                $"Если подвопрос {ifQuestion.Name} выбран в родителе, то ответ  не должен быть null. Получено: `{selectedAnswer}`");

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

                    foreach (var (answerName, answer) in ifQuestion.Answers
                                 .Where(a => ifQuestion.SelectedAnswer != a.Value))
                    {
                        MergeQuestionListWithAnsweredQuestionList(
                            answer.SubQuestions,
                            answeredQuestionView.SubQuestionByAnswer[answerName],
                            false);
                    }

                    break;
                }
                case InputQuestion inputQuestion:
                {
                    var enteredValue = answeredQuestionView.QuestionAnswer;
                    if (!isActiveQuestions)
                    {
                        if (enteredValue != null)
                            throw new BadRequestException(
                                $"Если подвопрос {inputQuestion.Name} не выбран в родителе, то ответ должен быть null. Получено: `{enteredValue}`");
                    }
                    else
                    {
                        inputQuestion.ActiveQuestion = true;
                        inputQuestion.EnteredValue = enteredValue;
                    }

                    break;
                }
                default:
                    throw new BadRequestException($"Такой тип вопроса не поддерживается: {question.Type.ToString()}");
            }
        }
    }
}