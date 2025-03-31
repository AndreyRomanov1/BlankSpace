using Domain.Objects.Blocks;
using Domain.Objects.Questions;

namespace Domain.Services.Interfaces;

public interface IQuestionService
{
    public Question[] GetQuestions(Block[] blocks);
}