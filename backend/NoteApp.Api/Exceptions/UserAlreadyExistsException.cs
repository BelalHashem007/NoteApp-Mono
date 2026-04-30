namespace NoteApp.Api.Exceptions
{
    public class UserAlreadyExistsException : Exception
    {
        public UserAlreadyExistsException() : base()
        {

        }

        public UserAlreadyExistsException(string message) : base(message)
        {

        }

        public UserAlreadyExistsException(string message, Exception inner) : base(message, inner)
        {

        }
    }
}
