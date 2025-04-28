using Domain.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Request = Web.Dto.Request;

namespace Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetricsController(IMetricsService metricsService) : ControllerBase
{
    [HttpPost("save")]
    public IActionResult SaveMetric(Request.SaveMetric saveMetric)
    {
        metricsService.SaveMetricValue(saveMetric.variable, saveMetric.FileId, saveMetric.Data);
        return Ok();
    }
}