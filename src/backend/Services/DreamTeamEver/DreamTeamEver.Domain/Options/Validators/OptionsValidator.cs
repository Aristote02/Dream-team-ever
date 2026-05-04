using System.Runtime.CompilerServices;

namespace DreamTeamEver.Domain.Options.Validators;

public abstract class OptionsValidator
{
    public static void ThrowIfStar(string argument, [CallerArgumentExpression(nameof(argument))] string? paramName = null)
    {
        if (argument == "*")
        {
            throw new OptionsException($"{paramName} has value '*', which usually means that value is not initialized");
        }
    }
}