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

        var id = Guid.NewGuid();
        var expiryTime = DateTime.UtcNow.Add(timeToLive);

        lock (lockObj)
        {
            storage[id] = new FileEntry(contentFile.Name, fileData, expiryTime);
        }

        return id;
    }

    public ContentFile GetFile(Guid id)
    {
        lock (lockObj)
        {
            if (!storage.TryGetValue(id, out var entry))
                throw new NotFoundException();
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