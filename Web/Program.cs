using Web.Configuration;

var builder = WebApplication.CreateBuilder(args);


builder.Services.ConfigureDomainServices();
builder.Services.ConfigureWebServices();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// MigrateIfNeed(app);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();


app.Run();

return;

// void MigrateIfNeed(WebApplication webApplication)
// {
//     using var scope = webApplication.Services.CreateScope();
//     var services = scope.ServiceProvider;
//     try
//     {
//         // TODO Добавить DbContext
//         //var context = services.GetRequiredService<DbContext>();
//         //context.Database.Migrate();
//         Console.WriteLine("Миграция: Успешна применена");
//     }
//     catch (Exception ex)
//     {
//         Console.WriteLine($"Миграция: Ошибка применения миграции: {ex.Message}");
//     }
// }