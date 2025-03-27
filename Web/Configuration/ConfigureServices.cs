using Domain.Services.Implementations;
using Domain.Services.Interfaces;
using Web.Services.Implementations;
using Web.Services.Interfaces;

namespace Web.Configuration;

public static class ConfigureServices
{
    public static IServiceCollection ConfigureWebServices(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddSingleton<ISurveyService, SurveyService>();
        return serviceCollection;
    }
    public static IServiceCollection ConfigureDomainServices(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddSingleton<ITokenFactory, TokenFactory>();
        serviceCollection.AddSingleton<ITokenParsingService, TokenParsingService>();
        serviceCollection.AddSingleton<IBlocksService, BlocksService>();
        serviceCollection.AddSingleton<IQuestionService, QuestionService>();
        return serviceCollection;
    }
}