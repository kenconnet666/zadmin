using System.Text.Json.Nodes;
using ZAdmin.WebView.Core;

namespace ZAdmin.WebView.Windows;

public sealed record HostOptions(
    string AssetsRoot,
    Uri InitialUri,
    string TrustedOrigin,
    IReadOnlySet<string> AllowedExternalOrigins,
    bool Development,
    string? SmokeReportPath)
{
    public static HostOptions FromEnvironment()
    {
        var assets = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "Assets", "Web"));
        var devValue = Environment.GetEnvironmentVariable("ZADMIN_WEBVIEW_DEV_URL");
        var development = Uri.TryCreate(devValue, UriKind.Absolute, out var devUri) &&
            devUri.IsLoopback &&
            (devUri.Scheme == Uri.UriSchemeHttp || devUri.Scheme == Uri.UriSchemeHttps);
        var initialUri = development ? devUri! : new Uri($"{WebViewSecurityPolicy.DefaultAppOrigin}/");
        var trustedOrigin = initialUri.GetLeftPart(UriPartial.Authority);
        var configured = ReadConfiguredOrigins(Path.Combine(AppContext.BaseDirectory, "webview.host.json"));
        var environmentOrigins = (Environment.GetEnvironmentVariable("ZADMIN_WEBVIEW_ALLOWED_ORIGINS") ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Concat(configured)
            .Select(value => new Uri(value, UriKind.Absolute))
            .Where(uri => uri.Scheme == Uri.UriSchemeHttps)
            .Select(uri => uri.GetLeftPart(UriPartial.Authority))
            .ToHashSet(StringComparer.Ordinal);
        var smokeReport = Environment.GetEnvironmentVariable("ZADMIN_WEBVIEW_SMOKE_REPORT");
        return new HostOptions(
            assets,
            initialUri,
            trustedOrigin,
            environmentOrigins,
            development,
            string.IsNullOrWhiteSpace(smokeReport) ? null : Path.GetFullPath(smokeReport));
    }

    private static IEnumerable<string> ReadConfiguredOrigins(string path)
    {
        if (!File.Exists(path)) return [];
        try
        {
            return (JsonNode.Parse(File.ReadAllText(path))?["allowedExternalOrigins"] as JsonArray)?
                .Select(node => node?.GetValue<string>())
                .OfType<string>()
                .ToArray() ?? [];
        }
        catch
        {
            return [];
        }
    }
}
