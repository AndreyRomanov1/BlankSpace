using System.Text;
using System.Text.Json;
using Domain.Repositories.Interfaces;
using Domain.Services.Interfaces;
using Infrastructure;

namespace Domain.Services.Implementations;

public class MetricsService(IFileStorageRepository fileStorageRepository, ISurveyService surveyService)
    : IMetricsService
{
    private const string FilePath = "metrics.csv";

    public void SaveMetricValue(string variable, Guid fileId, object data)
    {
        var file = fileStorageRepository.GetFile(fileId);
        using var ms = new MemoryStream();
        file.Stream.CopyTo(ms);
        var fileBytes = ms.ToArray();
        var fileHash = MurmurHash3.GetHash(fileBytes);
        var survey = surveyService.GetSurveyByDocx(fileId);
        var surveyJson = JsonSerializer.Serialize(survey);
        var surveyHash = MurmurHash3.GetHash(surveyJson);
        var dataJson = JsonSerializer.Serialize(data);

        var recordValues = new[]
            { variable, fileHash.ToString(), surveyHash.ToString(), DateTimeOffset.UtcNow.ToString(), dataJson };

        var fileExists = File.Exists(FilePath);

        using var writer = new StreamWriter(FilePath, true, Encoding.UTF8);
        if (!fileExists)
            writer.WriteLine("Variable,FileHash,SurveyHash,DateTime,Data");

        writer.WriteLine(string.Join(",", recordValues));
    }
}