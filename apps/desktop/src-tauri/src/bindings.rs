#[cfg(any(debug_assertions, all(test, feature = "bindings")))]
use std::{fs, path::PathBuf};

#[cfg(any(debug_assertions, all(test, feature = "bindings")))]
use specta_typescript::{Layout, Typescript};
use tauri_specta::{Builder, ErrorHandlingMode, collect_commands, collect_events};

use crate::system::{DesktopRuntimeReady, IPC_SCHEMA_VERSION};

pub fn builder<R: tauri::Runtime>() -> Builder<R> {
    Builder::<R>::new()
        .error_handling(ErrorHandlingMode::Result)
        .commands(collect_commands![
            crate::commands::desktop_channel_probe,
            crate::commands::desktop_error_probe,
            crate::commands::desktop_runtime_report
        ])
        .events(collect_events![DesktopRuntimeReady])
        .constant("IPC_SCHEMA_VERSION", IPC_SCHEMA_VERSION)
}

#[cfg(any(debug_assertions, all(test, feature = "bindings")))]
pub fn bindings_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src/lib/generated/tauri.ts")
}

#[cfg(any(debug_assertions, all(test, feature = "bindings")))]
pub fn export<R: tauri::Runtime>(builder: &Builder<R>) -> Result<(), Box<dyn std::error::Error>> {
    let path = bindings_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    builder.export(
        Typescript::default()
            .header("/* eslint-disable */")
            .layout(Layout::FlatFile),
        path,
    )?;
    Ok(())
}

#[cfg(all(test, feature = "bindings"))]
mod tests {
    use super::*;

    #[test]
    fn export_bindings() {
        export(&builder::<tauri::test::MockRuntime>())
            .expect("failed to export tauri-specta bindings");
    }
}
