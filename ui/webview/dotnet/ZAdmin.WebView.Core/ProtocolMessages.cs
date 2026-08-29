using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace ZAdmin.WebView.Core;

public sealed record ProtocolResponse(
    [property: JsonPropertyName("v")] int Version,
    [property: JsonPropertyName("kind")] string Kind,
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("ok")] bool Ok,
    [property: JsonPropertyName("result")] JsonNode? Result,
    [property: JsonPropertyName("error")] Generated.ProtocolError? Error);

public sealed record ProtocolEvent(
    [property: JsonPropertyName("v")] int Version,
    [property: JsonPropertyName("kind")] string Kind,
    [property: JsonPropertyName("topic")] string Topic,
    [property: JsonPropertyName("payload")] JsonNode? Payload);
