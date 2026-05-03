namespace NoteApp.Api.Exceptions
{
    public class CloudinaryException : Exception
    {
        public CloudinaryException() : base()
        {

        }

        public CloudinaryException(string message) : base(message)
        {

        }

        public CloudinaryException(string message, Exception inner) : base(message, inner)
        {

        }
    }
}
