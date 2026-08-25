mod bindings;
mod commands;
mod error;
mod state;
mod system;

#[cfg(feature = "desktop-runtime")]
use state::AppState;
#[cfg(feature = "desktop-runtime")]
use system::{DesktopRuntimeReady, IPC_SCHEMA_VERSION};
#[cfg(feature = "desktop-runtime")]
use tauri_specta::Event as _;

#[cfg(feature = "desktop-runtime")]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let bindings = bindings::builder::<tauri::Wry>();

    #[cfg(debug_assertions)]
    bindings::export(&bindings).expect("failed to export tauri-specta bindings");

    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(AppState::new())
        .invoke_handler(bindings.invoke_handler())
        .setup(move |app| {
            bindings.mount_events(app);
            DesktopRuntimeReady {
                schema_version: IPC_SCHEMA_VERSION,
            }
            .emit(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running ZAdmin desktop application");
}
