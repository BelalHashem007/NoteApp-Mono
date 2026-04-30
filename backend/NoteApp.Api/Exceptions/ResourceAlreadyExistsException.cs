namespace NoteApp.Api.Exceptions
{
    public class ResourceAlreadyExistsException : Exception
    {
        public ResourceAlreadyExistsException() : base()
        {

        }

        public ResourceAlreadyExistsException(string message) : base(message)
        {

        }

        public ResourceAlreadyExistsException(string message, Exception inner) : base(message, inner)
        {

        }
    }
}
