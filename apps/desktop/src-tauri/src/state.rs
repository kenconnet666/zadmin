use std::time::Instant;

pub struct AppState {
    started_at: Instant,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            started_at: Instant::now(),
        }
    }

    pub fn uptime_ms(&self) -> u32 {
        u32::try_from(self.started_at.elapsed().as_millis()).unwrap_or(u32::MAX)
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
