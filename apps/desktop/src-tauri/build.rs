const COMMANDS: &[&str] = &[
    "desktop_channel_probe",
    "desktop_error_probe",
    "desktop_runtime_report",
];

fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .app_manifest(tauri_build::AppManifest::new().commands(COMMANDS)),
    )
    .expect("failed to build ZAdmin desktop host");
}
