use serde::{Deserialize, Serialize};
use specta::Type;

pub const IPC_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct DesktopRuntimeReport {
    pub schema_version: u32,
    pub app_version: String,
    pub target_arch: String,
    pub target_os: String,
    pub debug: bool,
    pub uptime_ms: u32,
    pub capabilities: Vec<String>,
}

#[derive(Debug, Clone, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ErrorProbeRequest {
    pub force_failure: bool,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ErrorProbeResponse {
    pub echoed: String,
}

#[derive(Debug, Clone, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ChannelProbeRequest {
    pub count: u32,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ChannelProbeEvent {
    pub index: u32,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ChannelProbeSummary {
    pub delivered: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type, tauri_specta::Event)]
#[serde(rename_all = "camelCase")]
#[tauri_specta(event_name = "desktopRuntimeReady")]
pub struct DesktopRuntimeReady {
    pub schema_version: u32,
}
