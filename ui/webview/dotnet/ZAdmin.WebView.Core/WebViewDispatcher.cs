using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using ZAdmin.WebView.Core.Generated;

namespace ZAdmin.WebView.Core;

public delegate ValueTask<JsonNode?> WebViewCommandHandler(JsonNode? parameters, CancellationToken cancellationToken);

public sealed class WebViewDispatcher : IAsyncDisposable
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private readonly ConcurrentDictionary<string, CancellationTokenSource> _active = new(StringComparer.Ordinal);
    private readonly Dictionary<string, WebViewCommandHandler> _handlers = new(StringComparer.Ordinal);
    private readonly WebViewSecurityPolicy _security;

    public WebViewDispatcher(WebViewSecurityPolicy security, ResourceRegistry? resources = null)
    {
        _security = security ?? throw new ArgumentNullException(nameof(security));
        Resources = resources ?? new ResourceRegistry();
    }

    public ResourceRegistry Resources { get; }

    public WebViewDispatcher Register(string method, WebViewCommandHandler handler)
    {
        if (!WebViewProtocol.Methods.Contains(method))
        {
            throw new ArgumentOutOfRangeException(nameof(method), method, "Method is absent from the protocol allowlist.");
        }

        ArgumentNullException.ThrowIfNull(handler);
        if (!_handlers.TryAdd(method, handler)) throw new InvalidOperationException($"Handler already exists: {method}");
        return this;
    }

    public async ValueTask<string?> DispatchAsync(
        string json,
        string sourceOrigin,
        CancellationToken cancellationToken = default)
    {
        if (!_security.AllowsOrigin(sourceOrigin))
        {
            return SerializeFailure("", "permission-denied", "protocol.dispatch", "WebView message origin is not allowed.");
        }

        if (Encoding.UTF8.GetByteCount(json) > WebViewProtocol.MaxMessageBytes)
        {
            return SerializeFailure("", "protocol-error", "protocol.dispatch", "WebView message exceeds the size limit.");
        }

        JsonObject message;
        try
        {
            message = JsonNode.Parse(json)?.AsObject() ?? throw new JsonException("Message is empty.");
        }
        catch (Exception error) when (error is JsonException or InvalidOperationException)
        {
            return SerializeFailure("", "protocol-error", "protocol.dispatch", "WebView message is invalid JSON.");
        }

        if (message["v"]?.GetValue<int>() != WebViewProtocol.Version)
        {
            return SerializeFailure(ReadString(message, "id"), "protocol-error", "protocol.dispatch", "Protocol version mismatch.");
        }

        return ReadString(message, "kind") switch
        {
            "request" => await DispatchRequestAsync(message, cancellationToken).ConfigureAwait(false),
            "cancel" => Cancel(ReadString(message, "id")),
            "dispose" => await DisposeHandleAsync(ReadString(message, "handle")).ConfigureAwait(false),
            _ => SerializeFailure(ReadString(message, "id"), "protocol-error", "protocol.dispatch", "Unsupported message kind.")
        };
    }

    private async ValueTask<string> DispatchRequestAsync(JsonObject message, CancellationToken cancellationToken)
    {
        var id = ReadString(message, "id");
        var method = ReadString(message, "method");
        if (string.IsNullOrWhiteSpace(id) || !WebViewProtocol.Methods.Contains(method))
        {
            return SerializeFailure(id, "protocol-error", method, "Request id or method is invalid.");
        }

        if (!_handlers.TryGetValue(method, out var handler))
        {
            return SerializeFailure(id, "unsupported", method, "Desktop capability is not registered by this target.");
        }

        using var linked = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        if (!_active.TryAdd(id, linked)) return SerializeFailure(id, "protocol-error", method, "Duplicate request id.");
        try
        {
            var result = await handler(message["params"], linked.Token).ConfigureAwait(false);
            return JsonSerializer.Serialize(
                new ProtocolResponse(WebViewProtocol.Version, "response", id, true, result, null),
                SerializerOptions);
        }
        catch (OperationCanceledException)
        {
            return SerializeFailure(id, "cancelled", method, "Desktop operation was cancelled.");
        }
        catch (UnauthorizedAccessException error)
        {
            return SerializeFailure(id, "permission-denied", method, error.Message);
        }
        catch (Exception error)
        {
            return SerializeFailure(id, "system-error", method, error.Message, retryable: true);
        }
        finally
        {
            _active.TryRemove(id, out _);
        }
    }

    private string? Cancel(string id)
    {
        if (_active.TryGetValue(id, out var cancellation)) cancellation.Cancel();
        return null;
    }

    private async ValueTask<string?> DisposeHandleAsync(string handle)
    {
        if (!string.IsNullOrWhiteSpace(handle)) await Resources.DisposeAsync(handle).ConfigureAwait(false);
        return null;
    }

    private static string ReadString(JsonObject message, string name) =>
        message[name]?.GetValue<string>() ?? string.Empty;

    private static string SerializeFailure(
        string id,
        string code,
        string operation,
        string message,
        bool retryable = false) =>
        JsonSerializer.Serialize(
            new ProtocolResponse(
                WebViewProtocol.Version,
                "response",
                id,
                false,
                null,
                new ProtocolError(code, message, operation, retryable)),
            SerializerOptions);

    public async ValueTask DisposeAsync()
    {
        foreach (var cancellation in _active.Values) cancellation.Cancel();
        _active.Clear();
        await Resources.DisposeAsync().ConfigureAwait(false);
    }
}
