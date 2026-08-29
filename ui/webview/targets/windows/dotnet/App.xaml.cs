using Microsoft.UI.Xaml;

namespace ZAdmin.WebView.Windows;

public partial class App : Application
{
    private MainWindow? _window;

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        _window = new MainWindow();
        _window.Activate();
    }
}
