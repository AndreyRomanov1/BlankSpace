namespace Web.Dto.Request;

public record SaveMetric(string variable, Guid FileId, object Data);