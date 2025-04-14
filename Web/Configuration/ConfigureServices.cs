using DAL.Repositories.Implementation;
using Domain.Repositories.Interfaces;
using Domain.Services.Implementations;
using Domain.Services.Interfaces;

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
        serviceCollection.AddSingleton<ISurveyService, SurveyService>();
        serviceCollection.AddSingleton<IAnsweredSurveyService, AnsweredSurveyService>();
        return serviceCollection;
    }

    public static IServiceCollection ConfigureDALServices(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddSingleton<IFileStorageRepository, FileStorageRepository>();
        return serviceCollection;
    }
}