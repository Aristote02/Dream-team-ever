using System.Linq.Expressions;

namespace DreamTeamEver.Domain.Options.Validators;

public sealed class BaseOptionsValidator<T> : AbstractOptionsValidator<T> where T : class, IDreamTeamEverOptions
{
    private readonly List<string> _propertiesToValidate = [];
    private readonly Action<string, string>[] _validators;

    public BaseOptionsValidator(Action<string, string>[]? validators = null, params Expression<Func<T, object>>[] propertyExpressions)
    {
        _propertiesToValidate = propertyExpressions.Select(GetPropertyName).ToList();
        _validators = validators ?? [ArgumentException.ThrowIfNullOrWhiteSpace, ThrowIfStar];
    }

    protected override void ValidateInternal(T options)
    {
        ValidateProperties(options, _validators, _propertiesToValidate);
    }
    
    private static string GetPropertyName(Expression<Func<T, object>> expression)
    {
        if (expression.Body is MemberExpression member)
        {
            return member.Member.Name;
        }

        if (expression.Body is UnaryExpression unary && unary.Operand is MemberExpression memberExpression)
        {
            return memberExpression.Member.Name;
        }
        
        throw new InvalidOperationException("Invalid expression");
    }
}