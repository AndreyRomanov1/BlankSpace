using Microsoft.Extensions.FileProviders;
using Web.Configuration;

var builder = WebApplication.CreateBuilder(args);

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
if (app.Environment.IsDevelopment())
{
    Console.WriteLine(Path.Combine(builder.Environment.ContentRootPath, "../FRONT"));
    var frontPath = Path.Combine(builder.Environment.ContentRootPath, "../FRONT");
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

app.UseHttpsRedirection();
app.MapControllers();
app.UseCors("AllowAll");

app.Run();