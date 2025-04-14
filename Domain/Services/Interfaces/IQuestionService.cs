using Domain.Objects.Blocks;
using Domain.Objects.Survey;

namespace Domain.Services.Interfaces;

public interface IQuestionService
{
    public Survey GetSurvey(Block[] blocks);
}