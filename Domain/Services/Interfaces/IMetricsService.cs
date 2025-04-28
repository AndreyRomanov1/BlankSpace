namespace Domain.Services.Interfaces;

public interface IMetricsService
{
    void SaveMetricValue(string variable, Guid fileId, object data);
}