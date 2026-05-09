using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class CloudinaryUploader(Cloudinary cloudinary) : ICloudinaryUploader
    {
        public Task<ImageUploadResult> UploadAsync(ImageUploadParams uploadParams, CancellationToken ct) =>
            cloudinary.UploadAsync(uploadParams, ct);
    }
}

