using System.Runtime.InteropServices;
using System.Text.Json.Nodes;
using Microsoft.UI.Windowing;
using Microsoft.UI.Xaml;
using Windows.Graphics;
using WinRT.Interop;

namespace ZAdmin.WebView.Windows;

public sealed class WindowService
{
    private const uint WmNcLButtonDown = 0x00A1;
    private const int HtCaption = 2;
    private readonly AppWindow _appWindow;
    private readonly string _statePath;
    private readonly Window _window;
    private bool _focused;

    public WindowService(Window window, string statePath)
    {
        _window = window;
        _appWindow = window.AppWindow;
        _statePath = statePath;
        _appWindow.Changed += (_, _) => Changed?.Invoke(this, Snapshot());
    }

    public event EventHandler<JsonObject>? Changed;

    public void UpdateFocus(bool focused)
    {
        _focused = focused;
        Changed?.Invoke(this, Snapshot());
    }

    public JsonObject Snapshot()
    {
        var presenter = _appWindow.Presenter as OverlappedPresenter;
        var scale = (_window.Content as FrameworkElement)?.XamlRoot?.RasterizationScale ?? 1d;
        return new JsonObject
        {
            ["focused"] = _focused,
            ["height"] = _appWindow.Size.Height,
            ["maximized"] = presenter?.State == OverlappedPresenterState.Maximized,
            ["minimized"] = presenter?.State == OverlappedPresenterState.Minimized,
            ["scaleFactor"] = scale,
            ["visible"] = _appWindow.IsVisible,
            ["width"] = _appWindow.Size.Width
        };
    }

    public void Minimize() => Presenter().Minimize();
    public void Maximize() => Presenter().Maximize();
    public void Restore() => Presenter().Restore();
    public void ToggleMaximize()
    {
        var presenter = Presenter();
        if (presenter.State == OverlappedPresenterState.Maximized) presenter.Restore();
        else presenter.Maximize();
    }

    public void StartDragging()
    {
        var handle = WindowNative.GetWindowHandle(_window);
        ReleaseCapture();
        SendMessage(handle, WmNcLButtonDown, HtCaption, 0);
    }

    public async ValueTask SaveAsync(CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_statePath)!);
        var state = new JsonObject
        {
            ["height"] = _appWindow.Size.Height,
            ["maximized"] = Presenter().State == OverlappedPresenterState.Maximized,
            ["width"] = _appWindow.Size.Width,
            ["x"] = _appWindow.Position.X,
            ["y"] = _appWindow.Position.Y
        };
        await File.WriteAllTextAsync(_statePath, state.ToJsonString(), cancellationToken);
    }

    public async ValueTask RestoreAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(_statePath)) return;
        var state = JsonNode.Parse(await File.ReadAllTextAsync(_statePath, cancellationToken))?.AsObject();
        if (state is null) return;
        _appWindow.MoveAndResize(new RectInt32(
            state["x"]?.GetValue<int>() ?? _appWindow.Position.X,
            state["y"]?.GetValue<int>() ?? _appWindow.Position.Y,
            Math.Max(640, state["width"]?.GetValue<int>() ?? _appWindow.Size.Width),
            Math.Max(480, state["height"]?.GetValue<int>() ?? _appWindow.Size.Height)));
        if (state["maximized"]?.GetValue<bool>() is true) Presenter().Maximize();
    }

    private OverlappedPresenter Presenter() =>
        _appWindow.Presenter as OverlappedPresenter ?? throw new InvalidOperationException("Window presenter is unavailable.");

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool ReleaseCapture();

    [DllImport("user32.dll", EntryPoint = "SendMessageW")]
    private static extern nint SendMessage(nint window, uint message, nint wParam, nint lParam);
}
