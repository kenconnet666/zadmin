use serde::Serialize;
use specta::Type;
use thiserror::Error;

#[derive(Debug, Error, Serialize, Type)]
#[serde(tag = "code", content = "details", rename_all = "kebab-case")]
pub enum DesktopCommandError {
    #[error("invalid desktop command request: {message}")]
    InvalidRequest { message: String },
    #[error("desktop channel send failed: {message}")]
    Channel { message: String },
    #[error("the requested capability is unavailable: {capability}")]
    Unsupported { capability: String },
}
