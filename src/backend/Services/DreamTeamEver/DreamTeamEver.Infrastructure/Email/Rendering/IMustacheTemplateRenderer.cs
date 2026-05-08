namespace DreamTeamEver.Infrastructure.Email.Rendering;

internal interface IMustacheTemplateRenderer
{
    string Render(string templateFileName, object model);
}
