using System.Text;
using System.Text.Json;
using System.Xml.Linq;

namespace NoteApp.Api.Helpers
{
    public class TipTapParser
    {
        public string ExtractPlainText(string json)
        {
            if (string.IsNullOrEmpty(json)) return string.Empty;

            try
            {
                using var doc = JsonDocument.Parse(json);
                var sb = new StringBuilder();
                TraverseNodes(doc.RootElement, sb);
                return sb.ToString().Trim();
            }
            catch (JsonException)
            {
                return string.Empty;
            }
        }

        private void TraverseNodes(JsonElement element, StringBuilder sb)
        {
            //Get text content
            if (element.TryGetProperty("text", out var textProp))
            {
                string content = textProp.GetString() ?? "";
                string cleanedContent = content.Replace("\n", " ").Replace("\r", " ");
                sb.Append(cleanedContent + " ");
            }

            //Get links href
            if (element.TryGetProperty("marks", out var marksProp) && marksProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var mark in marksProp.EnumerateArray())
                {
                    if (mark.GetProperty("type").GetString() == "link" &&
                        mark.TryGetProperty("attrs", out var attrsForLink) &&
                        attrsForLink.TryGetProperty("href", out var href))
                    {
                        sb.Append(href.GetString() + " ");
                    }
                }
            }

            //Get images alt
            if (element.TryGetProperty("attrs", out var attrs))
            {
                if (attrs.TryGetProperty("alt", out var alt))
                {
                    sb.Append(alt.GetString() + " ");
                }
            }


            if (element.TryGetProperty("content", out var contentProp) && contentProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var child in contentProp.EnumerateArray())
                {
                    TraverseNodes(child, sb);
                }
            }
        }
    }
}
