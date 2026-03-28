namespace NoteApp.Api.Exceptions
{
    public class ExternalLoginFailedException : Exception
    {
        public ExternalLoginFailedException() : base()
        {

        }

        public ExternalLoginFailedException(string message) : base(message)
        {

        }

        public ExternalLoginFailedException(string message, Exception inner) : base(message, inner)
        {

        }
    }
}
