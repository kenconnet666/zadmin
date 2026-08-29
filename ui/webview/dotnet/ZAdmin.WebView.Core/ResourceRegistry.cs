using System.Collections.Concurrent;

namespace ZAdmin.WebView.Core;

public sealed class ResourceRegistry : IAsyncDisposable
{
    private readonly ConcurrentDictionary<string, IAsyncDisposable> _resources = new(StringComparer.Ordinal);

    public string Add(IAsyncDisposable resource)
    {
        ArgumentNullException.ThrowIfNull(resource);
        while (true)
        {
            var handle = Guid.NewGuid().ToString("N");
            if (_resources.TryAdd(handle, resource)) return handle;
        }
    }

    public async ValueTask<bool> DisposeAsync(string handle)
    {
        if (!_resources.TryRemove(handle, out var resource)) return false;
        await resource.DisposeAsync().ConfigureAwait(false);
        return true;
    }

    public async ValueTask DisposeAsync()
    {
        var resources = _resources.ToArray();
        _resources.Clear();
        List<Exception>? failures = null;
        foreach (var resource in resources.Reverse())
        {
            try
            {
                await resource.Value.DisposeAsync().ConfigureAwait(false);
            }
            catch (Exception error)
            {
                (failures ??= []).Add(error);
            }
        }

        if (failures is not null) throw new AggregateException(failures);
    }
}
