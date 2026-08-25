use tauri::{State, ipc::Channel};

use crate::{
    error::DesktopCommandError,
    state::AppState,
    system::{
        ChannelProbeEvent, ChannelProbeRequest, ChannelProbeSummary, DesktopRuntimeReport,
        ErrorProbeRequest, ErrorProbeResponse, IPC_SCHEMA_VERSION,
    },
};

#[tauri::command]
#[specta::specta]
pub fn desktop_runtime_report(state: State<'_, AppState>) -> DesktopRuntimeReport {
    DesktopRuntimeReport {
        schema_version: IPC_SCHEMA_VERSION,
        app_version: env!("CARGO_PKG_VERSION").to_owned(),
        target_arch: std::env::consts::ARCH.to_owned(),
        target_os: std::env::consts::OS.to_owned(),
        debug: cfg!(debug_assertions),
        uptime_ms: state.uptime_ms(),
        capabilities: vec![
            "app".to_owned(),
            "clipboard".to_owned(),
            "dialog".to_owned(),
            "filesystem".to_owned(),
            "log".to_owned(),
            "notification".to_owned(),
            "opener".to_owned(),
            "os".to_owned(),
            "process".to_owned(),
            "store".to_owned(),
            "window".to_owned(),
            "window-state".to_owned(),
        ],
    }
}

#[tauri::command]
#[specta::specta]
pub fn desktop_error_probe(
    request: ErrorProbeRequest,
) -> Result<ErrorProbeResponse, DesktopCommandError> {
    let message = request.message.trim();
    if message.is_empty() {
        return Err(DesktopCommandError::InvalidRequest {
            message: "message must not be empty".to_owned(),
        });
    }
    if request.force_failure {
        return Err(DesktopCommandError::Unsupported {
            capability: message.to_owned(),
        });
    }
    Ok(ErrorProbeResponse {
        echoed: message.to_owned(),
    })
}

#[tauri::command]
#[specta::specta]
pub fn desktop_channel_probe(
    request: ChannelProbeRequest,
    on_event: Channel<ChannelProbeEvent>,
) -> Result<ChannelProbeSummary, DesktopCommandError> {
    if !(1..=10).contains(&request.count) {
        return Err(DesktopCommandError::InvalidRequest {
            message: "count must be between 1 and 10".to_owned(),
        });
    }
    for index in 0..request.count {
        on_event
            .send(ChannelProbeEvent {
                index,
                message: request.message.clone(),
            })
            .map_err(|error| DesktopCommandError::Channel {
                message: error.to_string(),
            })?;
    }
    Ok(ChannelProbeSummary {
        delivered: request.count,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn error_probe_keeps_domain_errors_typed() {
        let result = desktop_error_probe(ErrorProbeRequest {
            force_failure: true,
            message: "camera".to_owned(),
        });
        assert!(matches!(
            result,
            Err(DesktopCommandError::Unsupported { capability }) if capability == "camera"
        ));
    }
}
