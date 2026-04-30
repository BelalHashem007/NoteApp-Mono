namespace NoteApp.Api.Helpers
{
    public static class ObjectMapperHelper
    {
        public static TDest Map<TSrc, TDest>(TSrc src) where TDest : new()
        {
            var dest = new TDest();

            var srcProps = typeof(TSrc).GetProperties();
            var destProps = typeof(TDest).GetProperties();

            foreach (var srcProp in srcProps)
            {
                var destProp = destProps.FirstOrDefault(p =>
                    p.Name == srcProp.Name &&
                    p.CanWrite &&
                    p.PropertyType == srcProp.PropertyType);

                if (destProp != null)
                {
                    var value = srcProp.GetValue(src);
                    destProp.SetValue(dest, value);
                }
            }

            return dest;
        }
    }
}
