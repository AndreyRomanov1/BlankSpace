using Domain.Exceptions;
using Domain.Objects.Storage;
using Domain.Repositories.Interfaces;

namespace DAL.Repositories.Implementation;

public class FileStorageRepository : IFileStorageRepository, IDisposable
{
    private readonly Timer cleanupTimer;
    private readonly object lockObj = new();
    private readonly Dictionary<Guid, FileEntry> storage = new();

    public FileStorageRepository()
    {
        cleanupTimer = new Timer(_ => CleanupExpiredFiles(), null, TimeSpan.Zero, TimeSpan.FromMinutes(1));
    }

    public void Dispose()
    {
        cleanupTimer.Dispose();
    }

    public Guid AddFile(ContentFile contentFile, TimeSpan timeToLive)
    {
        using var memoryStream = new MemoryStream();
        contentFile.Stream.CopyTo(memoryStream);
        var fileData = memoryStream.ToArray();

        var fileId = Guid.NewGuid();
        var expiryTime = DateTime.UtcNow.Add(timeToLive);

        lock (lockObj)
        {
            storage[fileId] = new FileEntry(contentFile.Name, fileData, expiryTime);
        }

        return fileId;
    }

    public ContentFile GetFile(Guid fileId)
    {
        lock (lockObj)
        {
            if (!storage.TryGetValue(fileId, out var entry))
                throw new NotFoundException($"Не найден файл на сервере по id `{fileId}`. Попробуйте загрузить шаблон ещё раз");
            return new ContentFile(entry.filename, new MemoryStream(entry.Content, false));
        }
    }

    private void CleanupExpiredFiles()
    {
        lock (lockObj)
        {
            var now = DateTimeOffset.UtcNow;
            var expiredKeys = storage
                .Where(kvp => kvp.Value.ExpiryTime <= now)
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (var key in expiredKeys)
                storage.Remove(key);
        }
    }
}

public record FileEntry(string filename, byte[] Content, DateTimeOffset ExpiryTime);