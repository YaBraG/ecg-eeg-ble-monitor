"""Configuration for the Android-friendly EEG demo analysis pipeline.

This module centralizes channel order, groups, event windows, and analysis
settings so they can be adjusted in one place.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


DEFAULT_CHANNEL_LABELS = [
    "C3", "C4", "CZ", "F3", "F4", "F7", "F8", "FZ",
    "FP1", "FP2", "FPZ", "O1", "O2", "P3", "P4", "PZ",
    "T3", "T4", "T5", "T6",
]

GROUP_A_LABELS = ["C3", "F3", "F7", "FP1", "O1", "PZ", "FZ", "P3", "T3", "T5"]
GROUP_B_LABELS = ["C4", "F4", "F8", "FP2", "O2", "P4", "T4", "T6", "FPZ"]

DEFAULT_ASSUMPTIONS = [
    "Demo-only analysis; not a medical diagnosis.",
    "The input TXT is whitespace-delimited numeric data with no header row.",
    "The first 20 columns are treated as EEG channels for analysis.",
    "All source columns are preserved in the debug/export package when available.",
    "A1 and A2 are assumed to be reference electrodes, not data channels.",
    "FPZ is assumed to be a real data channel.",
    "Default sampling rate is 500 Hz unless provided by the caller.",
    "Event/protocol timing comes from configuration and is clipped to recording duration.",
]

DEFAULT_BANDS_HZ = {
    "delta": (0.5, 4.0),
    "theta": (4.0, 8.0),
    "alpha": (8.0, 13.0),
    "beta": (13.0, 30.0),
    "gamma": (30.0, 80.0),
}

DEFAULT_HIGH_FREQUENCY_BANDS_HZ = {
    "highFreq_46_80": (46.0, 80.0),
    "ripple_80_150": (80.0, 150.0),
    "fastRipple_150_250": (150.0, 250.0),
}


@dataclass(slots=True)
class EEGAnalysisConfig:
    """User-editable pipeline settings.

    Every important value is exposed for easy modification after electrode
    layout or protocol confirmation.
    """

    fs: float = 500.0
    analysis_column_count: int = 20
    channel_labels: list[str] = field(default_factory=lambda: list(DEFAULT_CHANNEL_LABELS))
    group_a_labels: list[str] = field(default_factory=lambda: list(GROUP_A_LABELS))
    group_b_labels: list[str] = field(default_factory=lambda: list(GROUP_B_LABELS))
    assumptions: list[str] = field(default_factory=lambda: list(DEFAULT_ASSUMPTIONS))

    demo_only: bool = True
    ignored_initial_seconds: float = 270.0

    # FFT bandpass limits.
    filter_order: int = 4
    highpass_hz: float = 0.5
    lowpass_cap_hz: float = 250.0
    lowpass_nyquist_margin_hz: float = 1.0

    # Default event/protocol timing.
    event_onset_seconds: float = 300.0
    event_offset_seconds: float | None = None
    event_label: str = "demo_event"

    # Analysis/plot settings chosen to avoid huge figures on mobile.
    selected_overview_channels: list[str] = field(default_factory=lambda: ["C3", "C4", "F3", "F4", "T3", "T4"])
    max_plot_points: int = 12_000
    welch_nperseg: int = 2048
    spectrogram_nperseg: int = 1024
    spectrogram_noverlap: int = 768
    plot_dpi: int = 140

    # Optional heavier analysis sections are off by default.
    enable_classifier: bool = False
    enable_ica: bool = False

    create_debug_export: bool = True
    copy_source_txt_to_export: bool = False

    bands_hz: dict[str, tuple[float, float]] = field(default_factory=lambda: dict(DEFAULT_BANDS_HZ))
    high_frequency_bands_hz: dict[str, tuple[float, float]] = field(default_factory=lambda: dict(DEFAULT_HIGH_FREQUENCY_BANDS_HZ))

    @classmethod
    def from_dict(cls, values: dict[str, Any] | None = None) -> "EEGAnalysisConfig":
        """Build a config from a plain dict, ignoring unknown keys."""
        cfg = cls()
        if not values:
            return cfg
        for key, value in values.items():
            if hasattr(cfg, key):
                setattr(cfg, key, value)
        return cfg

    def to_dict(self) -> dict[str, Any]:
        out = asdict(self)
        # Convert tuples to lists so this can be JSON serialized without surprises.
        out["bands_hz"] = {k: list(v) for k, v in self.bands_hz.items()}
        out["high_frequency_bands_hz"] = {k: list(v) for k, v in self.high_frequency_bands_hz.items()}
        return out

    def bandpass_limits(self, fs: float | None = None) -> tuple[float, float]:
        """Return bandpass limits for the supplied sampling rate."""
        sample_rate = float(fs if fs is not None else self.fs)
        nyquist = sample_rate / 2.0
        lowpass = min(self.lowpass_cap_hz, nyquist - self.lowpass_nyquist_margin_hz)
        # Keep the lowpass safely above the highpass for unusual demo/sample rates.
        lowpass = max(lowpass, self.highpass_hz * 1.5)
        return float(self.highpass_hz), float(lowpass)

    def resolve_event_window(
        self,
        sample_count: int,
        fs: float | None = None,
    ) -> dict[str, Any]:
        """Resolve the configured event/ictal window.

        The returned onset and offset are clipped to the recording duration.
        """
        sample_rate = float(fs if fs is not None else self.fs)
        duration_s = float(sample_count) / sample_rate if sample_rate > 0 else 0.0
        requested_onset = float(self.event_onset_seconds)
        requested_offset = (
            duration_s if self.event_offset_seconds is None else float(self.event_offset_seconds)
        )
        onset = min(max(0.0, requested_onset), duration_s)
        offset = min(max(onset, requested_offset), duration_s)
        return {
            "label": str(self.event_label),
            "onsetSeconds": onset,
            "offsetSeconds": offset,
            "requestedOnsetSeconds": requested_onset,
            "requestedOffsetSeconds": requested_offset,
            "wasClippedToRecordingDuration": bool(
                abs(onset - requested_onset) > 1e-9 or abs(offset - requested_offset) > 1e-9
            ),
            "durationSeconds": max(0.0, offset - onset),
        }
