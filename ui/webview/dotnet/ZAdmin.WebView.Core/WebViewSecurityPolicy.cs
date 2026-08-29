namespace ZAdmin.WebView.Core;

public sealed class WebViewSecurityPolicy
{
    public const string DefaultAppOrigin = "https://app.zadmin.local";

    public WebViewSecurityPolicy(string appOrigin = DefaultAppOrigin)
    {
        if (!Uri.TryCreate(appOrigin, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps)
        {
            throw new ArgumentException("The WebView app origin must be an absolute HTTPS origin.", nameof(appOrigin));
        }

        AppOrigin = uri.GetLeftPart(UriPartial.Authority);
    }

    public string AppOrigin { get; }

    public bool AllowsOrigin(string origin) =>
        Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
        StringComparer.Ordinal.Equals(uri.GetLeftPart(UriPartial.Authority), AppOrigin);
}
