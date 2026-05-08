using System.Reflection;
using Stubble.Core.Builders;

namespace DreamTeamEver.Infrastructure.Email.Rendering;

internal sealed class EmbeddedMustacheTemplateRenderer : IMustacheTemplateRenderer
{
    private readonly Assembly _assembly = typeof(EmbeddedMustacheTemplateRenderer).Assembly;
    private readonly Lazy<Stubble.Core.StubbleVisitorRenderer> _renderer = new(() => new StubbleBuilder().Build());
    private readonly Dictionary<string, string> _templates = new(StringComparer.OrdinalIgnoreCase);

    public string Render(string templateFileName, object model)
    {
        var template = GetTemplate(templateFileName);
        return _renderer.Value.Render(template, model);
    }

    private string GetTemplate(string templateFileName)
    {
        if (_templates.TryGetValue(templateFileName, out var template))
        {
            return template;
        }

        var resourceName = _assembly
            .GetManifestResourceNames()
            .FirstOrDefault(x => x.EndsWith($"Email.Templates.{templateFileName}", StringComparison.OrdinalIgnoreCase));

        if (resourceName is null)
        {
            throw new FileNotFoundException($"Embedded email template '{templateFileName}' was not found.");
        }

        using var stream = _assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException($"Unable to open embedded resource stream for '{resourceName}'.");
        using var reader = new StreamReader(stream);
        template = reader.ReadToEnd();
        _templates[templateFileName] = template;

        return template;
    }
}
