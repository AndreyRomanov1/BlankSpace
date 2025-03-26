using Domain.Objects.Blocks;
using Domain.Objects.Questions;
using Domain.Services.Interfaces;

namespace Domain.Services.Implementation;

public class QuestionService : IQuestionService
{
    public Question[] GetQuestions(Block[] blocks)
    {
        return GetQuestionsByRecursively(blocks);
    }

    private Question[] GetQuestionsByRecursively(Block[] blocks,
        Dictionary<(string, QuestionType), Question>? questionByText = null)
    {
        var parentQuestions = questionByText?.ToDictionary() ?? new Dictionary<(string, QuestionType), Question>();
        var currentQuestions = new Dictionary<(string, QuestionType), Question>();

        foreach (var block in blocks)
        {
            var questionType = block.GetBlockType().ToQuestionType();
            if (!parentQuestions.TryGetValue((block.MainToken.QuestionText, questionType), out var question)
                && !currentQuestions.TryGetValue((block.MainToken.QuestionText, questionType), out question))
            {
                switch (block)
                {
                    case IfBlock ifBlock:
                    {
                        var ifQuestion = new IfQuestion(ifBlock.IfToken.QuestionText);
                        ifQuestion.Answers.Add(ifBlock.IfToken.AnswerText, new IfAnswer(ifBlock.IfToken.AnswerText));
                        ifQuestion.Answers[ifBlock.IfToken.AnswerText].Blocks.Add(ifBlock);
                        currentQuestions.Add((ifQuestion.Name, QuestionType.IfQuestion), ifQuestion);
                        break;
                    }
                    case InputBlock inputBlock:
                    {
                        var inputQuestion = new InputQuestion(inputBlock.InputToken.QuestionText);
                        inputQuestion.Blocks.Add(inputBlock);
                        currentQuestions.Add((inputQuestion.Name, QuestionType.InputQuestion), inputQuestion);
                        break;
                    }
                    default:
                        throw new ArgumentOutOfRangeException($"Не поддерживается блок {block.GetBlockType()}");
                }
            }
            else
            {
                switch (block)
                {
                    case IfBlock ifBlock:
                    {
                        if (question is not IfQuestion ifQuestion)
                            throw new Exception("Блок и вопрос разных типов");
                        if (!ifQuestion.Answers.TryGetValue(ifBlock.IfToken.AnswerText, out var answer))
                        {
                            answer = new IfAnswer(ifBlock.IfToken.AnswerText);
                            ifQuestion.Answers.Add(answer.Answer, answer);
                        }

                        answer.Blocks.Add(ifBlock);
                        break;
                    }
                    case InputBlock inputBlock:
                    {
                        if (question is not InputQuestion inputQuestion)
                            throw new Exception("Блок и вопрос разных типов");
                        inputQuestion.Blocks.Add(inputBlock);
                        break;
                    }
                    default:
                        throw new ArgumentOutOfRangeException($"Не поддерживается блок {block.GetBlockType()}");
                }
            }
        }

        var nextParentQuestions = parentQuestions.Concat(currentQuestions).ToDictionary();
        foreach (var question in currentQuestions)
        {
            if (question.Value is not IfQuestion ifQuestion)
                continue;
            foreach (var answer in ifQuestion.Answers)
                answer.Value.SubQuestions =
                    GetQuestionsByRecursively(answer.Value.Blocks.SelectMany(t => t.ChildBlocks).ToArray(),
                        nextParentQuestions);
        }

        return currentQuestions.Select(t => t.Value).ToArray();
    }
}

public static class Extensions
{
    public static QuestionType ToQuestionType(this BlockType blockType)
    {
        return blockType switch
        {
            BlockType.IfBlock => QuestionType.IfQuestion,
            BlockType.InputBlock => QuestionType.InputQuestion,
            _ => throw new ArgumentOutOfRangeException(nameof(blockType), blockType, null)
        };
    }
}