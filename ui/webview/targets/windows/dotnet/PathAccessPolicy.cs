namespace ZAdmin.WebView.Windows;

public sealed class PathAccessPolicy
{
    private readonly HashSet<string> _directories = new(StringComparer.OrdinalIgnoreCase);
    private readonly HashSet<string> _files = new(StringComparer.OrdinalIgnoreCase);
    private readonly Lock _gate = new();

    public PathAccessPolicy(string appDataRoot)
    {
        Directory.CreateDirectory(appDataRoot);
        GrantDirectory(appDataRoot);
    }

    public void GrantDirectory(string path)
    {
        lock (_gate) _directories.Add(NormalizeDirectory(path));
    }

    public void GrantFile(string path)
    {
        lock (_gate) _files.Add(Path.GetFullPath(path));
    }

    public string Demand(string path)
    {
        var fullPath = Path.GetFullPath(path);
        lock (_gate)
        {
            if (_files.Contains(fullPath) || _directories.Any(directory =>
                    fullPath.StartsWith(directory, StringComparison.OrdinalIgnoreCase)))
            {
                return fullPath;
            }
        }

        throw new UnauthorizedAccessException("The path was not granted by the application or a user picker.");
    }

    private static string NormalizeDirectory(string path) =>
        Path.GetFullPath(path).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
}
