using System.Reflection;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Domain.Options.Validators;

public abstract class AbstractOptionsValidator<T> : OptionsValidator, IValidateOptions<T> where T : class, IDreamTeamEverOptions
{
    public ValidateOptionsResult Validate(string? name, T options)
    {
        if (options is null)
        {
            return ValidateOptionsResult.Fail($"{typeof(T).Name} object is null.");
        }

        try
        {
            ValidateInternal(options);

            return ValidateOptionsResult.Success;
        }
        catch (Exception ex)
        {
            return ValidateOptionsResult.Fail($"{typeof(T).Name} is incorrect. Error message: {ex.Message}");
        }
    }
    
    protected abstract void ValidateInternal(T options);

    protected void ValidateProperties(T options, Action<string, string>[] validators, List<string> propertiesToValidate)
    {
        var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
        properties = propertiesToValidate != null && propertiesToValidate.Count != 0
            ? properties.Where(x => propertiesToValidate.Contains(x.Name) && x.Name != nameof(IDreamTeamEverOptions.SectionName)).ToArray()
            : properties;

        foreach (var property in properties)
        {
            var value =  property.GetValue(options);
            var paramName = property.Name;

            if (value == null)
            {
                throw new OptionsException($"{paramName} has value 'null', which usually means that value is not initialized.");
            }

            foreach (var validator in validators)
            {
                validator(value.ToString(), paramName);
            }
        }
    }
}