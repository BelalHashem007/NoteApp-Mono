using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace NoteApp.Api.Helpers
{
    public static class ModelStateHelper
    {
        public static Dictionary<string,string> GetErrors(ModelStateDictionary modelState)
        {
            return  modelState
                .Where(x => x.Value.Errors.Count > 0 && x.Key != "dto")
                .ToDictionary(
                    kvp => kvp.Key.Replace("$.",""),
                    kvp => string.Join(", ", kvp.Value.Errors.Select(error => error.ErrorMessage))
                );
        }
    }
}
