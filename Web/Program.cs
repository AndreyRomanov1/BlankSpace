using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// builder.Services.ConfigureServices // TODO добавить сервисы в DI

var app = builder.Build();

MigrateIfNeed(app);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();


app.Run();

return;

void MigrateIfNeed(WebApplication webApplication)
{
    using var scope = webApplication.Services.CreateScope();
    var services = scope.ServiceProvider;
    try
    {
        // TODO Добавить DbContext
        //var context = services.GetRequiredService<DbContext>();
        //context.Database.Migrate();
        Console.WriteLine("Миграция: Успешна применена");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Миграция: Ошибка применения миграции: {ex.Message}");
    }
}