namespace DreamTeamEver.Domain.Options;

public class OptionsException : Exception
{
    public OptionsException() 
    { }

    public OptionsException(string message) : base(message)
    {
    }
}