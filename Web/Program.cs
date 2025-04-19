using System.Diagnostics;
using System.Net;
using Microsoft.Extensions.FileProviders;
using Web.Configuration;

var builder = WebApplication.CreateBuilder(args);

const int port = 5000;
var httpLocalhost = $"http://localhost:{port}";
const string mainPage = "/index.html";
builder.WebHost
    .ConfigureKestrel(serverOptions => serverOptions.Listen(IPAddress.Loopback, port))
    .UseUrls(httpLocalhost);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.ConfigureDomainServices();
builder.Services.ConfigureDALServices();
builder.Services.ConfigureWebServices();


var app = builder.Build();
var logger = app.Services.GetRequiredService<ILogger<Program>>();


if (app.Environment.IsDevelopment())
{
    var frontPath = Path.Combine(builder.Environment.ContentRootPath, "../FRONT");
    logger.LogInformation("Путь до фронта: {}", frontPath);
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(frontPath),
        RequestPath = ""
    });
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseStaticFiles();
}

app.MapControllers();
app.UseCors("AllowAll");
app.Lifetime.ApplicationStarted.Register(() =>
{
    try
    {
        Process.Start(new ProcessStartInfo(httpLocalhost + mainPage) { UseShellExecute = true });
    }
    catch (Exception ex)
    {
        logger.LogError("Не удалось открыть браузер: {}", ex.Message);
    }
});

app.Run();