using CloudinaryDotNet.Actions;

namespace NoteApp.Api.Interfaces.IService
{
    public interface ICloudinaryUploader
    {
        Task<ImageUploadResult> UploadAsync(ImageUploadParams uploadParams, CancellationToken ct);
    }
}

