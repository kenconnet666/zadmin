using System.Diagnostics;
using System.Globalization;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.UI.Xaml;
using Microsoft.Windows.AppNotifications;
using Microsoft.Windows.AppNotifications.Builder;
using Windows.ApplicationModel.DataTransfer;
using Windows.Storage.Pickers;
using WinRT.Interop;
using ZAdmin.WebView.Core;
using ZAdmin.WebView.Core.Generated;

namespace ZAdmin.WebView.Windows;

public sealed class WindowsCommandModule : IDisposable
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private readonly HostOptions _options;
    private readonly PathAccessPolicy _paths;
    private readonly StoreService _store;
    private readonly Window _window;
    private readonly WindowService _windows;
    private readonly string _logPath;
    private bool _notificationRegistered;

    public WindowsCommandModule(
        Window window,
        WindowService windows,
        HostOptions options,
        string webviewVersion)
    {
        _window = window;
        _windows = windows;
        _options = options;
        WebviewVersion = webviewVersion;
        var appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "ZAdmin");
        _paths = new PathAccessPolicy(appData);
        _store = new StoreService(Path.Combine(appData, "settings.json"));
        _logPath = Path.Combine(appData, "logs", "desktop.log");
    }

    public string WebviewVersion { get; }

    public void Register(WebViewDispatcher dispatcher)
    {
        dispatcher
            .Register(WebViewProtocol.AppSnapshot, AppSnapshot)
            .Register(WebViewProtocol.ClipboardClear, ClipboardClear)
            .Register(WebViewProtocol.ClipboardReadText, ClipboardReadText)
            .Register(WebViewProtocol.ClipboardWriteText, ClipboardWriteText)
            .Register(WebViewProtocol.DialogOpen, DialogOpen)
            .Register(WebViewProtocol.DialogSave, DialogSave)
            .Register(WebViewProtocol.FilesystemExists, FilesystemExists)
            .Register(WebViewProtocol.FilesystemReadText, FilesystemReadText)
            .Register(WebViewProtocol.FilesystemRemove, FilesystemRemove)
            .Register(WebViewProtocol.FilesystemWriteText, FilesystemWriteText)
            .Register(WebViewProtocol.LogWrite, LogWrite)
            .Register(WebViewProtocol.NotificationPermission, NotificationPermission)
            .Register(WebViewProtocol.NotificationRequestPermission, NotificationPermission)
            .Register(WebViewProtocol.NotificationSend, NotificationSend)
            .Register(WebViewProtocol.OpenerOpenUrl, OpenerOpenUrl)
            .Register(WebViewProtocol.OsSnapshot, OsSnapshot)
            .Register(WebViewProtocol.ProcessExit, ProcessExit)
            .Register(WebViewProtocol.ProcessRelaunch, ProcessRelaunch)
            .Register(WebViewProtocol.StoreClear, StoreClear)
            .Register(WebViewProtocol.StoreDelete, StoreDelete)
            .Register(WebViewProtocol.StoreGet, StoreGet)
            .Register(WebViewProtocol.StoreKeys, StoreKeys)
            .Register(WebViewProtocol.StoreSave, StoreSave)
            .Register(WebViewProtocol.StoreSet, StoreSet)
            .Register(WebViewProtocol.UpdaterCheck, Empty)
            .Register(WebViewProtocol.WindowClose, WindowClose)
            .Register(WebViewProtocol.WindowMaximize, (_, _) => Run(_windows.Maximize))
            .Register(WebViewProtocol.WindowMinimize, (_, _) => Run(_windows.Minimize))
            .Register(WebViewProtocol.WindowRestore, (_, _) => Run(_windows.Restore))
            .Register(WebViewProtocol.WindowSnapshot, (_, _) => ValueTask.FromResult<JsonNode?>(_windows.Snapshot()))
            .Register(WebViewProtocol.WindowStartDragging, (_, _) => Run(_windows.StartDragging))
            .Register(WebViewProtocol.WindowToggleMaximize, (_, _) => Run(_windows.ToggleMaximize))
            .Register(WebViewProtocol.WindowStateRestore, (_, token) => RestoreWindow(token))
            .Register(WebViewProtocol.WindowStateSave, (_, token) => SaveWindow(token));
    }

    private ValueTask<JsonNode?> AppSnapshot(JsonNode? _, CancellationToken cancellationToken) =>
        ValueTask.FromResult<JsonNode?>(new JsonObject
        {
            ["environment"] = _options.Development ? "development" : "production",
            ["name"] = Assembly.GetEntryAssembly()?.GetName().Name ?? "ZAdmin",
            ["version"] = Assembly.GetEntryAssembly()?.GetName().Version?.ToString() ?? "0.0.0",
            ["webviewVersion"] = WebviewVersion
        });

    private static ValueTask<JsonNode?> ClipboardClear(JsonNode? _, CancellationToken cancellationToken)
    {
        Clipboard.Clear();
        return ValueTask.FromResult<JsonNode?>(null);
    }

    private static async ValueTask<JsonNode?> ClipboardReadText(JsonNode? _, CancellationToken cancellationToken)
    {
        var content = Clipboard.GetContent();
        var text = content.Contains(StandardDataFormats.Text) ? await content.GetTextAsync() : string.Empty;
        return new JsonObject { ["text"] = text };
    }

    private static ValueTask<JsonNode?> ClipboardWriteText(JsonNode? parameters, CancellationToken cancellationToken)
    {
        var package = new DataPackage();
        package.SetText(RequiredString(parameters, "text"));
        Clipboard.SetContent(package);
        Clipboard.Flush();
        return ValueTask.FromResult<JsonNode?>(null);
    }

    private async ValueTask<JsonNode?> DialogOpen(JsonNode? parameters, CancellationToken cancellationToken)
    {
        var options = Object(parameters);
        var directory = options["directory"]?.GetValue<bool>() is true;
        var multiple = options["multiple"]?.GetValue<bool>() is true;
        var handle = WindowNative.GetWindowHandle(_window);
        if (directory)
        {
            var picker = new FolderPicker { SuggestedStartLocation = PickerLocationId.DocumentsLibrary };
            picker.FileTypeFilter.Add("*");
            InitializeWithWindow.Initialize(picker, handle);
            var folder = await picker.PickSingleFolderAsync();
            if (folder is not null) _paths.GrantDirectory(folder.Path);
            return new JsonObject { ["paths"] = new JsonArray(folder is null ? [] : [folder.Path]) };
        }

        var filePicker = new FileOpenPicker { SuggestedStartLocation = PickerLocationId.DocumentsLibrary };
        AddOpenFilters(filePicker, options["filters"] as JsonObject);
        InitializeWithWindow.Initialize(filePicker, handle);
        var paths = new List<string>();
        if (multiple)
        {
            foreach (var file in await filePicker.PickMultipleFilesAsync())
            {
                _paths.GrantFile(file.Path);
                paths.Add(file.Path);
            }
        }
        else
        {
            var file = await filePicker.PickSingleFileAsync();
            if (file is not null)
            {
                _paths.GrantFile(file.Path);
                paths.Add(file.Path);
            }
        }

        return new JsonObject { ["paths"] = new JsonArray(paths.Select(path => JsonValue.Create(path)).ToArray()) };
    }

    private async ValueTask<JsonNode?> DialogSave(JsonNode? parameters, CancellationToken cancellationToken)
    {
        var options = Object(parameters);
        var picker = new FileSavePicker { SuggestedStartLocation = PickerLocationId.DocumentsLibrary };
        var defaultPath = options["defaultPath"]?.GetValue<string>();
        if (!string.IsNullOrWhiteSpace(defaultPath)) picker.SuggestedFileName = Path.GetFileName(defaultPath);
        AddSaveFilters(picker, options["filters"] as JsonObject);
        InitializeWithWindow.Initialize(picker, WindowNative.GetWindowHandle(_window));
        var file = await picker.PickSaveFileAsync();
        if (file is not null) _paths.GrantFile(file.Path);
        return new JsonObject { ["path"] = file?.Path };
    }

    private ValueTask<JsonNode?> FilesystemExists(JsonNode? parameters, CancellationToken cancellationToken)
    {
        var path = _paths.Demand(RequiredString(parameters, "path"));
        return ValueTask.FromResult<JsonNode?>(new JsonObject { ["value"] = File.Exists(path) || Directory.Exists(path) });
    }

    private async ValueTask<JsonNode?> FilesystemReadText(JsonNode? parameters, CancellationToken cancellationToken)
    {
        var path = _paths.Demand(RequiredString(parameters, "path"));
        return new JsonObject { ["text"] = await File.ReadAllTextAsync(path, cancellationToken) };
    }

    private ValueTask<JsonNode?> FilesystemRemove(JsonNode? parameters, CancellationToken cancellationToken)
    {
        Confirmed(parameters);
        var path = _paths.Demand(RequiredString(parameters, "path"));
        if (File.Exists(path)) File.Delete(path);
        else if (Directory.Exists(path)) Directory.Delete(path, recursive: false);
        return ValueTask.FromResult<JsonNode?>(null);
    }

    private async ValueTask<JsonNode?> FilesystemWriteText(JsonNode? parameters, CancellationToken cancellationToken)
    {
        var path = _paths.Demand(RequiredString(parameters, "path"));
        await File.WriteAllTextAsync(path, RequiredString(parameters, "contents"), cancellationToken);
        return null;
    }

    private async ValueTask<JsonNode?> LogWrite(JsonNode? parameters, CancellationToken cancellationToken)
    {
        var entry = Object(parameters);
        var line = JsonSerializer.Serialize(new
        {
            at = DateTimeOffset.UtcNow,
            fields = entry["fields"],
            level = RequiredString(parameters, "level"),
            message = RequiredString(parameters, "message")
        }, SerializerOptions);
        Directory.CreateDirectory(Path.GetDirectoryName(_logPath)!);
        await File.AppendAllTextAsync(_logPath, $"{line}{Environment.NewLine}", cancellationToken);
        Debug.WriteLine(line);
        return null;
    }

    private ValueTask<JsonNode?> NotificationPermission(JsonNode? _, CancellationToken cancellationToken) =>
        ValueTask.FromResult<JsonNode?>(JsonValue.Create(EnsureNotifications() ? "granted" : "denied"));

    private ValueTask<JsonNode?> NotificationSend(JsonNode? parameters, CancellationToken cancellationToken)
    {
        if (!EnsureNotifications()) throw new InvalidOperationException("Windows app notifications are unavailable.");
        var options = Object(parameters);
        var builder = new AppNotificationBuilder().AddText(RequiredString(parameters, "title"));
        var body = options["body"]?.GetValue<string>();
        if (!string.IsNullOrWhiteSpace(body)) builder.AddText(body);
        AppNotificationManager.Default.Show(builder.BuildNotification());
        return ValueTask.FromResult<JsonNode?>(null);
    }

    private ValueTask<JsonNode?> OpenerOpenUrl(JsonNode? parameters, CancellationToken cancellationToken)
    {
        var uri = new Uri(RequiredString(parameters, "url"), UriKind.Absolute);
        var origin = uri.GetLeftPart(UriPartial.Authority);
        if (uri.Scheme != Uri.UriSchemeHttps || !_options.AllowedExternalOrigins.Contains(origin))
        {
            throw new UnauthorizedAccessException("External URL origin is not allowed by the native host.");
        }
        Process.Start(new ProcessStartInfo(uri.AbsoluteUri) { UseShellExecute = true });
        return ValueTask.FromResult<JsonNode?>(null);
    }

    private static ValueTask<JsonNode?> OsSnapshot(JsonNode? _, CancellationToken cancellationToken) =>
        ValueTask.FromResult<JsonNode?>(new JsonObject
        {
            ["arch"] = RuntimeInformation.OSArchitecture.ToString().ToLowerInvariant(),
            ["locale"] = CultureInfo.CurrentUICulture.Name,
            ["platform"] = "windows",
            ["version"] = Environment.OSVersion.VersionString
        });

    private ValueTask<JsonNode?> ProcessExit(JsonNode? parameters, CancellationToken cancellationToken)
    {
        Confirmed(parameters);
        var code = Object(parameters)["code"]?.GetValue<int>() ?? 0;
        ScheduleExit(code, relaunch: false);
        return ValueTask.FromResult<JsonNode?>(null);
    }

    private ValueTask<JsonNode?> ProcessRelaunch(JsonNode? parameters, CancellationToken cancellationToken)
    {
        Confirmed(parameters);
        ScheduleExit(0, relaunch: true);
        return ValueTask.FromResult<JsonNode?>(null);
    }

    private async ValueTask<JsonNode?> StoreClear(JsonNode? _, CancellationToken cancellationToken) { await _store.ClearAsync(cancellationToken); return null; }
    private async ValueTask<JsonNode?> StoreDelete(JsonNode? parameters, CancellationToken cancellationToken) =>
        new JsonObject { ["value"] = await _store.DeleteAsync(RequiredString(parameters, "key"), cancellationToken) };
    private ValueTask<JsonNode?> StoreGet(JsonNode? parameters, CancellationToken cancellationToken) =>
        _store.GetAsync(RequiredString(parameters, "key"), cancellationToken);
    private async ValueTask<JsonNode?> StoreKeys(JsonNode? _, CancellationToken cancellationToken) =>
        new JsonObject { ["values"] = new JsonArray((await _store.KeysAsync(cancellationToken)).Select(key => JsonValue.Create(key)).ToArray()) };
    private async ValueTask<JsonNode?> StoreSave(JsonNode? _, CancellationToken cancellationToken) { await _store.SaveAsync(cancellationToken); return null; }
    private async ValueTask<JsonNode?> StoreSet(JsonNode? parameters, CancellationToken cancellationToken)
    {
        var options = Object(parameters);
        await _store.SetAsync(RequiredString(parameters, "key"), options["value"], cancellationToken);
        return null;
    }

    private ValueTask<JsonNode?> WindowClose(JsonNode? _, CancellationToken cancellationToken)
    {
        _window.DispatcherQueue.TryEnqueue(_window.Close);
        return ValueTask.FromResult<JsonNode?>(null);
    }
    private async ValueTask<JsonNode?> RestoreWindow(CancellationToken token) { await _windows.RestoreAsync(token); return null; }
    private async ValueTask<JsonNode?> SaveWindow(CancellationToken token) { await _windows.SaveAsync(token); return null; }

    private static ValueTask<JsonNode?> Empty(JsonNode? _, CancellationToken cancellationToken) => ValueTask.FromResult<JsonNode?>(null);
    private static ValueTask<JsonNode?> Run(Action action) { action(); return ValueTask.FromResult<JsonNode?>(null); }
    private static JsonObject Object(JsonNode? parameters) => parameters?.AsObject() ?? throw new ArgumentException("Command params must be an object.");
    private static string RequiredString(JsonNode? parameters, string name) =>
        Object(parameters)[name]?.GetValue<string>() ?? throw new ArgumentException($"Missing string parameter: {name}");
    private static void Confirmed(JsonNode? parameters)
    {
        if (Object(parameters)["confirmed"]?.GetValue<bool>() is not true) throw new UnauthorizedAccessException("Explicit confirmation is required.");
    }

    private static void AddOpenFilters(FileOpenPicker picker, JsonObject? filters)
    {
        var values = Extensions(filters).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        foreach (var extension in values.Length == 0 ? ["*"] : values) picker.FileTypeFilter.Add(extension);
    }

    private static void AddSaveFilters(FileSavePicker picker, JsonObject? filters)
    {
        var groups = filters?.ToDictionary(
            item => item.Key,
            item => (IList<string>)((item.Value as JsonArray)?.Select(node => NormalizeExtension(node?.GetValue<string>() ?? string.Empty)).Where(value => value != "*").ToList() ?? []));
        if (groups is null || groups.Count == 0) groups = new Dictionary<string, IList<string>> { ["Text"] = [".txt"] };
        foreach (var group in groups.Where(group => group.Value.Count > 0)) picker.FileTypeChoices.Add(group.Key, group.Value);
    }

    private static IEnumerable<string> Extensions(JsonObject? filters) =>
        filters?.SelectMany(group => (group.Value as JsonArray)?.Select(node => NormalizeExtension(node?.GetValue<string>() ?? string.Empty)) ?? []) ?? [];
    private static string NormalizeExtension(string value) => value == "*" || value.StartsWith('.') ? value : $".{value}";

    private void ScheduleExit(int code, bool relaunch) => _ = Task.Run(async () =>
    {
        await Task.Delay(150);
        if (relaunch && Environment.ProcessPath is { } path) Process.Start(new ProcessStartInfo(path) { UseShellExecute = true });
        Environment.Exit(code);
    });

    private bool EnsureNotifications()
    {
        if (_notificationRegistered) return true;
        try
        {
            if (!AppNotificationManager.IsSupported()) return false;
            AppNotificationManager.Default.Register();
            _notificationRegistered = true;
            return true;
        }
        catch
        {
            return false;
        }
    }

    public void Dispose()
    {
        if (_notificationRegistered) AppNotificationManager.Default.Unregister();
    }
}
