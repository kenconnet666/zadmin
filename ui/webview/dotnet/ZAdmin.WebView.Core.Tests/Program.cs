using System.Text.Json.Nodes;
using ZAdmin.WebView.Core;
using ZAdmin.WebView.Core.Generated;

static void Assert(bool condition, string message)
{
    if (!condition) throw new InvalidOperationException(message);
}

var security = new WebViewSecurityPolicy();
Assert(security.AllowsOrigin(WebViewSecurityPolicy.DefaultAppOrigin), "Default app origin was rejected.");
Assert(!security.AllowsOrigin("https://evil.example"), "Foreign origin was accepted.");
Assert(new WebViewSecurityPolicy("http://127.0.0.1:5173", allowLoopbackHttp: true)
    .AllowsOrigin("http://127.0.0.1:5173"), "Explicit loopback development origin was rejected.");
try
{
    _ = new WebViewSecurityPolicy("http://evil.example", allowLoopbackHttp: true);
    throw new InvalidOperationException("Non-loopback HTTP origin was accepted.");
}
catch (ArgumentException)
{
}

await using var dispatcher = new WebViewDispatcher(security);
dispatcher.Register(WebViewProtocol.AppSnapshot, (_, _) =>
    ValueTask.FromResult<JsonNode?>(new JsonObject { ["name"] = "ZAdmin" }));

var success = await dispatcher.DispatchAsync(
    """{"v":1,"kind":"request","id":"one","method":"app.snapshot","params":{}}""",
    WebViewSecurityPolicy.DefaultAppOrigin);
Assert(success?.Contains("\"ok\":true", StringComparison.Ordinal) is true, "Registered request failed.");
Assert(success?.Contains("ZAdmin", StringComparison.Ordinal) is true, "Result payload was lost.");

var unsupported = await dispatcher.DispatchAsync(
    """{"v":1,"kind":"request","id":"two","method":"os.snapshot","params":{}}""",
    WebViewSecurityPolicy.DefaultAppOrigin);
Assert(unsupported?.Contains("unsupported", StringComparison.Ordinal) is true, "Missing handler was not rejected.");

var foreign = await dispatcher.DispatchAsync(
    """{"v":1,"kind":"request","id":"three","method":"app.snapshot","params":{}}""",
    "https://evil.example");
Assert(foreign?.Contains("permission-denied", StringComparison.Ordinal) is true, "Foreign message origin was accepted.");

var wrongVersion = await dispatcher.DispatchAsync(
    """{"v":2,"kind":"request","id":"four","method":"app.snapshot","params":{}}""",
    WebViewSecurityPolicy.DefaultAppOrigin);
Assert(wrongVersion?.Contains("version mismatch", StringComparison.OrdinalIgnoreCase) is true, "Version drift was accepted.");

var disposed = false;
var handle = dispatcher.Resources.Add(new TestResource(() => disposed = true));
await dispatcher.DispatchAsync(
    $$"""{"v":1,"kind":"dispose","handle":"{{handle}}"}""",
    WebViewSecurityPolicy.DefaultAppOrigin);
Assert(disposed, "Resource handle was not disposed.");

Console.WriteLine("ZAdmin.WebView.Core contract tests passed.");

file sealed class TestResource(Action dispose) : IAsyncDisposable
{
    public ValueTask DisposeAsync()
    {
        dispose();
        return ValueTask.CompletedTask;
    }
}
