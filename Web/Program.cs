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

// MigrateIfNeed(app);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();
app.UseCors("AllowAll");

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