// BlankSpace/Web/Program.cs

using Web.Configuration;
// Возможно, понадобится добавить using Microsoft.AspNetCore.Cors; - но скорее всего он уже есть в GlobalUsings

var builder = WebApplication.CreateBuilder(args);

// --- НАЧАЛО ИЗМЕНЕНИЙ/ДОБАВЛЕНИЙ ---

// Определяем имя политики CORS (хорошая практика)
var AllowAllOriginsPolicy = "_allowAllOriginsPolicy";

// Добавляем сервисы CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowAllOriginsPolicy,
                      policy =>
                      {
                          // РАЗРЕШАЕМ ЛЮБОЙ ИСТОЧНИК (ЛЮБОЙ АДРЕС)
                          policy.AllowAnyOrigin()
                          // РАЗРЕШАЕМ ЛЮБОЙ HTTP МЕТОД (GET, POST, PUT, DELETE и т.д.)
                                .AllowAnyMethod()
                          // РАЗРЕШАЕМ ЛЮБЫЕ ЗАГОЛОВКИ в запросе
                                .AllowAnyHeader();
                          // ВАЖНО: С AllowAnyOrigin() нельзя использовать AllowCredentials()
                      });
    // Если у вас была другая политика CORS (например, MyAllowSpecificOrigins),
    // вы можете ее оставить или удалить, если она больше не нужна.
});

// --- КОНЕЦ ИЗМЕНЕНИЙ/ДОБАВЛЕНИЙ в секции Services ---


builder.Services.ConfigureDomainServices();
builder.Services.ConfigureWebServices();

// Явно указываем порт для HTTPS редиректа (если вы решили это использовать)
builder.Services.AddHttpsRedirection(options =>
{
    options.RedirectStatusCode = StatusCodes.Status307TemporaryRedirect;
    options.HttpsPort = 7006; // Убедитесь, что порт верный
});


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // В режиме разработки можно включить страницу ошибок для разработчиков
    app.UseDeveloperExceptionPage();
}
else
{
    // В продакшене можно настроить обработку ошибок по-другому
    // app.UseExceptionHandler("/Error");
    // app.UseHsts(); // Включать HSTS только если уверены в HTTPS
}

// Используем HTTPS Redirection (если настроили и хотите использовать)
// app.UseHttpsRedirection();

// --- НАЧАЛО ИЗМЕНЕНИЙ/ДОБАВЛЕНИЙ ---

// Добавляем middleware CORS ПЕРЕД UseAuthorization и MapControllers
// Указываем имя нашей новой политики "AllowAllOriginsPolicy"
app.UseCors(AllowAllOriginsPolicy);

// --- КОНЕЦ ИЗМЕНЕНИЙ/ДОБАВЛЕНИЙ в секции Middleware ---


// app.UseAuthorization(); // Если будете добавлять авторизацию, CORS должен быть до нее

app.MapControllers();

app.Run();

// return; // Эта строка не нужна после app.Run()