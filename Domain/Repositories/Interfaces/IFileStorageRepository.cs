using Domain.Objects.Storage;

namespace Domain.Repositories.Interfaces;

public interface IFileStorageRepository
{
    public Guid AddFile(ContentFile contentFile, TimeSpan timeToLive);
    public ContentFile GetFile(Guid fileId);
}