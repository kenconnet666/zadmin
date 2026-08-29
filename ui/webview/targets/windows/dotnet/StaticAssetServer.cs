using Microsoft.Web.WebView2.Core;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace ZAdmin.WebView.Windows;

public sealed class StaticAssetServer
{
    private readonly string _assetsRoot;
    private readonly CoreWebView2Environment _environment;

    public StaticAssetServer(string assetsRoot, CoreWebView2Environment environment)
    {
        _assetsRoot = Path.GetFullPath(assetsRoot).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        _environment = environment;
    }

    public void Handle(CoreWebView2WebResourceRequestedEventArgs args)
    {
        var uri = new Uri(args.Request.Uri);
        var relative = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));
        if (string.IsNullOrEmpty(relative)) relative = "index.html";
        var path = Path.GetFullPath(Path.Combine(_assetsRoot, relative.Replace('/', Path.DirectorySeparatorChar)));
        if (!path.StartsWith(_assetsRoot, StringComparison.OrdinalIgnoreCase))
        {
            args.Response = Response(Stream.Null, 403, "Forbidden", "text/plain; charset=utf-8", string.Empty);
            return;
        }

        if (!File.Exists(path) && string.IsNullOrEmpty(Path.GetExtension(relative)))
        {
            path = Path.Combine(_assetsRoot, "index.html");
        }

        if (!File.Exists(path))
        {
            args.Response = Response(Stream.Null, 404, "Not Found", "text/plain; charset=utf-8", string.Empty);
            return;
        }

        args.Response = Response(File.OpenRead(path), 200, "OK", ContentType(path), ScriptHashes(path));
    }

    private CoreWebView2WebResourceResponse Response(
        Stream content,
        int status,
        string reason,
        string contentType,
        string scriptHashes)
    {
        var headers = string.Join("\r\n",
            $"Content-Type: {contentType}",
            "Cache-Control: no-cache",
            $"Content-Security-Policy: default-src 'self'; script-src 'self' {scriptHashes}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
            "Cross-Origin-Opener-Policy: same-origin",
            "Referrer-Policy: no-referrer",
            "X-Content-Type-Options: nosniff");
        return _environment.CreateWebResourceResponse(content.AsRandomAccessStream(), status, reason, headers);
    }

    private static string ScriptHashes(string path)
    {
        if (!Path.GetExtension(path).Equals(".html", StringComparison.OrdinalIgnoreCase)) return string.Empty;
        var html = File.ReadAllText(path);
        return string.Join(' ', Regex.Matches(html, @"<script(?:\s[^>]*)?>([\s\S]*?)</script>", RegexOptions.IgnoreCase)
            .Select(match => match.Groups[1].Value)
            .Where(script => !string.IsNullOrWhiteSpace(script))
            .Select(script => $"'sha256-{Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(script)))}'"));
    }

    private static string ContentType(string path) => Path.GetExtension(path).ToLowerInvariant() switch
    {
        ".css" => "text/css; charset=utf-8",
        ".html" => "text/html; charset=utf-8",
        ".js" or ".mjs" => "text/javascript; charset=utf-8",
        ".json" or ".map" => "application/json; charset=utf-8",
        ".png" => "image/png",
        ".jpg" or ".jpeg" => "image/jpeg",
        ".svg" => "image/svg+xml",
        ".webp" => "image/webp",
        ".woff2" => "font/woff2",
        _ => "application/octet-stream"
    };
}
