using Microsoft.UI.Xaml;

namespace ZAdmin.WebView.Windows;

public sealed partial class MainWindow : Window
{
    private WebViewHost? _host;

    public MainWindow()
    {
        InitializeComponent();
        Closed += OnClosed;
        Activated += OnActivated;
        _ = InitializeAsync();
    }

    private async Task InitializeAsync()
    {
        try
        {
            _host = new WebViewHost(this, Browser, HostOptions.FromEnvironment());
            await _host.InitializeAsync();
        }
        catch (Exception error)
        {
            var smokeReport = Environment.GetEnvironmentVariable("ZADMIN_WEBVIEW_SMOKE_REPORT");
            if (!string.IsNullOrWhiteSpace(smokeReport))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(smokeReport)!);
                await File.WriteAllTextAsync(
                    smokeReport,
                    System.Text.Json.JsonSerializer.Serialize(new { error = error.ToString() }));
                DispatcherQueue.TryEnqueue(Close);
                return;
            }
            Browser.Visibility = Visibility.Collapsed;
            FailureMessage.Text = error.Message;
            FailurePanel.Visibility = Visibility.Visible;
        }
    }

    private void OnActivated(object sender, WindowActivatedEventArgs args) =>
        _host?.Window.UpdateFocus(args.WindowActivationState != WindowActivationState.Deactivated);

    private async void OnClosed(object sender, WindowEventArgs args)
    {
        if (_host is not null) await _host.DisposeAsync();
    }
}
