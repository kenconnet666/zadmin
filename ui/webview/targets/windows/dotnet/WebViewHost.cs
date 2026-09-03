using System.Text.Json;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.Web.WebView2.Core;
using ZAdmin.WebView.Core;
using ZAdmin.WebView.Core.Generated;

namespace ZAdmin.WebView.Windows;

public sealed class WebViewHost : IAsyncDisposable
{
    private sealed class DesktopEvidencePage
    {
        public string? Origin { get; set; }
        public string? Title { get; set; }
        public string? BodyText { get; set; }
        public bool HasBridge { get; set; }
        public bool ViteClient { get; set; }
        public string[] Errors { get; set; } = [];
        public DesktopEvidenceItem[]? DesktopEvidence { get; set; }
        public string? StatusBefore { get; set; }
        public int ComponentActionRunsBefore { get; set; }
    }

    private sealed class DesktopEvidenceItem
    {
        public string? Name { get; set; }
        public string? Marker { get; set; }
        public bool Present { get; set; }
        public JsonElement Native { get; set; }
    }

    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private const string CaptureDesktopEvidenceScript = """
        (() => {
          const collect = (name, marker) => {
            const node = document.querySelector(`[data-desktop-evidence="${marker}"]`);
            return {
              name,
              marker,
              present: node !== null,
              native: {
                tag: node?.tagName ?? null,
                type: node?.getAttribute('type') ?? null,
                disabled: node?.hasAttribute('disabled') ?? false,
                text: node?.textContent?.trim() ?? '',
                ariaLive: node?.getAttribute('aria-live') ?? null
              }
            };
          };
          const componentAction = document.querySelector(
            '[data-desktop-evidence="ZButton-component-action"]'
          );
          return JSON.stringify({
            origin: location.origin,
            title: document.title,
            bodyText: document.body?.innerText?.slice(0, 1000) ?? '',
            hasBridge: Boolean(globalThis.chrome?.webview),
            viteClient:
              [...document.scripts].some((script) => script.src.includes('/@vite/client')) ||
              performance
                .getEntriesByType('resource')
                .some((entry) => entry.name.includes('/@vite/client')),
            errors: globalThis.__ZADMIN_WEBVIEW_ERRORS__ ?? [],
            desktopEvidence: [
              collect('ZBox', 'ZBox-status'),
              collect('ZStack', 'ZStack'),
              collect('ZText', 'ZText'),
              collect('ZButton', 'ZButton-component-action')
            ],
            statusBefore:
              document.querySelector('[data-desktop-evidence="ZBox-status"]')?.innerText ?? '',
            componentActionRunsBefore: Number(
              componentAction?.getAttribute('data-desktop-evidence-runs') ?? '0'
            )
          });
        })()
        """;
    private const string ClickComponentEvidenceScript =
        "document.querySelector('[data-desktop-evidence=\"ZButton-component-action\"]')?.click()";
    private const string ReadComponentEvidenceRunsScript =
        "Number(document.querySelector('[data-desktop-evidence=\"ZButton-component-action\"]')?.getAttribute('data-desktop-evidence-runs')??'0')";
    private const string ReadStatusScript =
        "JSON.stringify(document.querySelector('[data-desktop-evidence=\"ZBox-status\"]')?.innerText??'')";
    private readonly HostOptions _options;
    private readonly WebView2 _webview;
    private readonly Microsoft.UI.Xaml.Window _window;
    private CoreWebView2Environment? _environment;
    private string? _webViewVersion;
    private StaticAssetServer? _assets;
    private WebViewDispatcher? _dispatcher;
    private WindowsCommandModule? _commands;
    private int _recoveryAttempts;
    private int _smokeNavigationGeneration;
    private TaskCompletionSource<bool>? _smokeResponse;

    public WebViewHost(Microsoft.UI.Xaml.Window window, WebView2 webview, HostOptions options)
    {
        _window = window;
        _webview = webview;
        _options = options;
        var appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "ZAdmin");
        Window = new WindowService(window, Path.Combine(appData, "window-state.json"));
        Window.Changed += OnWindowChanged;
    }

    public WindowService Window { get; }

    public async Task InitializeAsync()
    {
        if (_options.SmokeReportPath is { } smokeReport)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(smokeReport)!);
            await WriteSmokeReportAsync(smokeReport, JsonSerializer.Serialize(new { phase = "initializing" }));
        }
        var version = CoreWebView2Environment.GetAvailableBrowserVersionString();
        _webViewVersion = version;
        await WriteSmokePhaseAsync("runtime-detected");
        var userData = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "ZAdmin",
            "WebView2");
        Directory.CreateDirectory(userData);
        _environment = await CoreWebView2Environment.CreateWithOptionsAsync(
            null,
            userData,
            new CoreWebView2EnvironmentOptions());
        await WriteSmokePhaseAsync("environment-created");
        await _webview.EnsureCoreWebView2Async(_environment);
        await WriteSmokePhaseAsync("webview-ready");
        var core = _webview.CoreWebView2;
        core.Settings.AreDefaultContextMenusEnabled = _options.Development;
        core.Settings.AreDevToolsEnabled = _options.Development;
        core.Settings.AreBrowserAcceleratorKeysEnabled = _options.Development;
        core.Settings.AreHostObjectsAllowed = false;
        core.Settings.IsStatusBarEnabled = false;
        core.Settings.IsWebMessageEnabled = true;
        await core.AddScriptToExecuteOnDocumentCreatedAsync(
            "Object.defineProperty(globalThis,'__ZADMIN_WEBVIEW_ERRORS__',{value:[],writable:false,configurable:false});" +
            "addEventListener('error',event=>__ZADMIN_WEBVIEW_ERRORS__.push(String(event.error?.message??event.message)));" +
            "addEventListener('unhandledrejection',event=>__ZADMIN_WEBVIEW_ERRORS__.push(String(event.reason?.message??event.reason)));" +
            "addEventListener('securitypolicyviolation',event=>__ZADMIN_WEBVIEW_ERRORS__.push(`CSP ${event.violatedDirective} ${event.blockedURI}`));"
        );
        await WriteSmokePhaseAsync("diagnostics-injected");

        if (_options.Development)
        {
            var origin = JsonSerializer.Serialize(_options.TrustedOrigin);
            await core.AddScriptToExecuteOnDocumentCreatedAsync(
                $"Object.defineProperty(globalThis,'__ZADMIN_WEBVIEW_TRUSTED_ORIGIN__',{{value:{origin},writable:false,configurable:false}});");
            await WriteSmokePhaseAsync("development-origin-injected");
        }
        else
        {
            if (!Directory.Exists(_options.AssetsRoot))
            {
                throw new DirectoryNotFoundException($"Web assets are missing: {_options.AssetsRoot}");
            }
            _assets = new StaticAssetServer(_options.AssetsRoot, _environment);
            core.AddWebResourceRequestedFilter(
                $"{WebViewSecurityPolicy.DefaultAppOrigin}/*",
                CoreWebView2WebResourceContext.All);
            core.WebResourceRequested += OnWebResourceRequested;
        }

        _dispatcher = new WebViewDispatcher(
            new WebViewSecurityPolicy(_options.TrustedOrigin, allowLoopbackHttp: _options.Development));
        _commands = new WindowsCommandModule(_window, Window, _options, version);
        _commands.Register(_dispatcher);
        await WriteSmokePhaseAsync("commands-registered");
        core.WebMessageReceived += OnWebMessageReceived;
        core.NavigationStarting += OnNavigationStarting;
        core.NewWindowRequested += OnNewWindowRequested;
        core.PermissionRequested += OnPermissionRequested;
        core.DownloadStarting += OnDownloadStarting;
        core.ProcessFailed += OnProcessFailed;
        core.DOMContentLoaded += OnDomContentLoaded;
        _webview.Source = _options.InitialUri;
        await WriteSmokePhaseAsync("navigation-started");
    }

    private async void OnWebMessageReceived(CoreWebView2 sender, CoreWebView2WebMessageReceivedEventArgs args)
    {
        if (_dispatcher is null) return;
        string message;
        try
        {
            message = args.TryGetWebMessageAsString();
        }
        catch (ArgumentException)
        {
            return;
        }

        var isSmokeRequest = IsSmokeRequest(message);
        var response = await _dispatcher.DispatchAsync(message, Origin(args.Source));
        if (response is not null) sender.PostWebMessageAsJson(response);
        if (isSmokeRequest) _smokeResponse?.TrySetResult(IsSuccessfulSmokeResponse(response));
    }

    private static bool IsSmokeRequest(string message)
    {
        try
        {
            using var document = JsonDocument.Parse(message);
            var root = document.RootElement;
            return root.TryGetProperty("v", out var version) && version.GetInt32() == WebViewProtocol.Version &&
                root.TryGetProperty("kind", out var kind) && kind.GetString() == "request" &&
                root.TryGetProperty("id", out var id) && id.GetString() == "smoke" &&
                root.TryGetProperty("method", out var method) && method.GetString() == WebViewProtocol.AppSnapshot;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static bool IsSuccessfulSmokeResponse(string? response)
    {
        if (response is null) return false;
        try
        {
            var message = JsonSerializer.Deserialize<ProtocolResponse>(response, SerializerOptions);
            return message is not null &&
                message.Version == WebViewProtocol.Version &&
                message.Kind == "response" &&
                message.Id == "smoke" &&
                message.Ok;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private void OnWebResourceRequested(CoreWebView2 sender, CoreWebView2WebResourceRequestedEventArgs args) =>
        _assets?.Handle(args);

    private void OnNavigationStarting(CoreWebView2 sender, CoreWebView2NavigationStartingEventArgs args)
    {
        if (!Uri.TryCreate(args.Uri, UriKind.Absolute, out var uri) ||
            !StringComparer.Ordinal.Equals(uri.GetLeftPart(UriPartial.Authority), _options.TrustedOrigin))
        {
            args.Cancel = true;
            return;
        }

        // Vite can replace the first document after dependency optimization. Mark the old smoke
        // handler stale as soon as navigation starts instead of waiting for the replacement DOM.
        if (_options.SmokeReportPath is not null)
            Interlocked.Increment(ref _smokeNavigationGeneration);
    }

    private static void OnNewWindowRequested(CoreWebView2 sender, CoreWebView2NewWindowRequestedEventArgs args) =>
        args.Handled = true;

    private static void OnPermissionRequested(CoreWebView2 sender, CoreWebView2PermissionRequestedEventArgs args) =>
        args.State = CoreWebView2PermissionState.Deny;

    private static void OnDownloadStarting(CoreWebView2 sender, CoreWebView2DownloadStartingEventArgs args) =>
        args.Cancel = true;

    private void OnProcessFailed(CoreWebView2 sender, CoreWebView2ProcessFailedEventArgs args)
    {
        if (_recoveryAttempts++ < 3) _webview.Reload();
    }

    private async void OnDomContentLoaded(CoreWebView2 sender, CoreWebView2DOMContentLoadedEventArgs args)
    {
        if (_options.SmokeReportPath is null) return;
        var generation = Volatile.Read(ref _smokeNavigationGeneration);
        // Vite may reload once after its first dependency optimization. Only the last quiet navigation
        // owns the smoke report so overlapping DOMContentLoaded handlers never race on the same file.
        await Task.Delay(750);
        if (generation != Volatile.Read(ref _smokeNavigationGeneration)) return;
        var closeWindow = true;
        var smokePhase = "waiting-for-hydration";
        DesktopEvidencePage? evidenceBefore = null;
        try
        {
            _smokeResponse = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
            // A non-empty body can still be Vite's transient pre-optimization document. Wait for
            // an explicit marker set from Svelte onMount, and let a replacement navigation own the report.
            var hydrated = false;
            for (var attempt = 0; attempt < 300; attempt++)
            {
                if (generation != Volatile.Read(ref _smokeNavigationGeneration))
                {
                    closeWindow = false;
                    return;
                }
                if (await sender.ExecuteScriptAsync(
                        "document.querySelector('[data-zadmin-webview-ready=\"true\"]')!==null") == "true")
                {
                    hydrated = true;
                    break;
                }
                await Task.Delay(100);
            }
            if (!hydrated) throw new TimeoutException("Development page did not reach its hydrated marker.");
            if (generation != Volatile.Read(ref _smokeNavigationGeneration))
            {
                closeWindow = false;
                return;
            }
            smokePhase = "capturing-components";
            var pageValue = await sender.ExecuteScriptAsync(
                CaptureDesktopEvidenceScript);
            var pageJson = JsonSerializer.Deserialize<string>(pageValue) ?? "{}";
            evidenceBefore = JsonSerializer.Deserialize<DesktopEvidencePage>(pageJson, SerializerOptions) ?? throw new InvalidOperationException("Desktop evidence page state is unreadable.");
            if (evidenceBefore.DesktopEvidence is null || evidenceBefore.DesktopEvidence.Length != 4 || evidenceBefore.DesktopEvidence.Any(item => !item.Present))
                throw new InvalidOperationException("Desktop evidence markers are incomplete or not hydrated.");
            smokePhase = "validating-bridge-round-trip";
            var bridgeRequest = JsonSerializer.Serialize(
                new { v = WebViewProtocol.Version, kind = "request", id = "smoke", method = WebViewProtocol.AppSnapshot, @params = new { } },
                SerializerOptions);
            await sender.ExecuteScriptAsync(
                $"chrome.webview.postMessage({JsonSerializer.Serialize(bridgeRequest)})");
            var bridgeResponseValidated = await _smokeResponse.Task.WaitAsync(TimeSpan.FromSeconds(10));
            if (!bridgeResponseValidated)
                throw new InvalidOperationException("WebView bridge app.snapshot response was not successful.");
            smokePhase = "validating-component-interaction";
            await sender.ExecuteScriptAsync(ClickComponentEvidenceScript);
            var componentActionRunsAfter = evidenceBefore.ComponentActionRunsBefore;
            var expectedComponentActionRuns = evidenceBefore.ComponentActionRunsBefore + 1;
            for (var attempt = 0; attempt < 100; attempt++)
            {
                var actionValue = await sender.ExecuteScriptAsync(ReadComponentEvidenceRunsScript);
                if (int.TryParse(actionValue, out componentActionRunsAfter) && componentActionRunsAfter == expectedComponentActionRuns)
                {
                    break;
                }
                await Task.Delay(100);
            }
            if (componentActionRunsAfter != expectedComponentActionRuns)
                throw new TimeoutException("ZButton component evidence action did not update its observable state.");
            var pageAfterValue = await sender.ExecuteScriptAsync(ReadStatusScript);
            smokePhase = "writing-report";
            var report = new
            {
                bridgeRoundTrip = new { method = WebViewProtocol.AppSnapshot, requestReceived = true, responseValidated = bridgeResponseValidated },
                navigation = true,
                page = new { evidenceBefore.Origin, evidenceBefore.Title, evidenceBefore.BodyText, evidenceBefore.HasBridge, evidenceBefore.ViteClient, hydrated = true, webViewVersion = _webViewVersion, evidenceBefore.Errors, statusBefore = evidenceBefore.StatusBefore, statusAfter = JsonSerializer.Deserialize<string>(pageAfterValue), componentActionRunsBefore = evidenceBefore.ComponentActionRunsBefore, componentActionRunsAfter, componentActionDelta = componentActionRunsAfter - evidenceBefore.ComponentActionRunsBefore },
                protocol = WebViewProtocol.Version,
                source = _webview.Source?.ToString(),
                revision = Environment.GetEnvironmentVariable("GITHUB_SHA") ?? "local",
                target = "windows-x64",
                host = new { runtime = "WebView2", implementation = "WebViewHost", origin = evidenceBefore.Origin, webViewVersion = _webViewVersion, protocolVersion = WebViewProtocol.Version, navigation = true, hydrated = true, bridge = evidenceBefore.HasBridge, bridgeResponseValidated, pageErrors = evidenceBefore.Errors, source = _webview.Source?.ToString() },
                components = evidenceBefore.DesktopEvidence
            };
            Directory.CreateDirectory(Path.GetDirectoryName(_options.SmokeReportPath)!);
            await WriteSmokeReportAsync(
                _options.SmokeReportPath,
                JsonSerializer.Serialize(report, new JsonSerializerOptions(SerializerOptions) { WriteIndented = true }));
        }
        catch (Exception error) when (_options.Development && error.HResult == unchecked((int)0x8007139F))
        {
            // Vite's first dependency optimization can replace the current document while the old
            // DOMContentLoaded handler is reading it. The replacement navigation owns the report.
            closeWindow = false;
        }
        catch (Exception error)
        {
            await WriteSmokeReportAsync(
                _options.SmokeReportPath,
                JsonSerializer.Serialize(new { error = error.Message, phase = smokePhase, components = evidenceBefore?.DesktopEvidence }));
        }
        finally
        {
            if (closeWindow) _window.DispatcherQueue.TryEnqueue(_window.Close);
        }
    }

    private void OnWindowChanged(object? sender, System.Text.Json.Nodes.JsonObject snapshot) =>
        SendEvent("window.changed", snapshot);

    private void SendEvent(string topic, System.Text.Json.Nodes.JsonNode? payload)
    {
        if (_webview.CoreWebView2 is null) return;
        var message = new ProtocolEvent(WebViewProtocol.Version, "event", topic, payload);
        _webview.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(message, SerializerOptions));
    }

    private static string Origin(string source) =>
        Uri.TryCreate(source, UriKind.Absolute, out var uri)
            ? uri.GetLeftPart(UriPartial.Authority)
            : string.Empty;

    internal static async Task WriteSmokeReportAsync(string path, string contents)
    {
        for (var attempt = 0; ; attempt++)
        {
            try
            {
                await File.WriteAllTextAsync(path, contents);
                return;
            }
            catch (IOException) when (attempt < 49)
            {
                await Task.Delay(100);
            }
            catch (UnauthorizedAccessException) when (attempt < 49)
            {
                await Task.Delay(100);
            }
        }
    }

    private Task WriteSmokePhaseAsync(string phase) =>
        _options.SmokeReportPath is { } path
            ? WriteSmokeReportAsync(path, JsonSerializer.Serialize(new { phase }))
            : Task.CompletedTask;

    public async ValueTask DisposeAsync()
    {
        Window.Changed -= OnWindowChanged;
        if (_webview.CoreWebView2 is { } core)
        {
            core.WebResourceRequested -= OnWebResourceRequested;
            core.WebMessageReceived -= OnWebMessageReceived;
            core.NavigationStarting -= OnNavigationStarting;
            core.NewWindowRequested -= OnNewWindowRequested;
            core.PermissionRequested -= OnPermissionRequested;
            core.DownloadStarting -= OnDownloadStarting;
            core.ProcessFailed -= OnProcessFailed;
            core.DOMContentLoaded -= OnDomContentLoaded;
        }
        _commands?.Dispose();
        if (_dispatcher is not null) await _dispatcher.DisposeAsync();
        _webview.Close();
    }
}
