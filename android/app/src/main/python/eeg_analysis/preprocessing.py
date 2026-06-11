"""Preprocessing helpers for EEG validation, filtering, and slicing."""

from __future__ import annotations

from typing import Any

import numpy as np

from .config import EEGAnalysisConfig


def validate_eeg_matrix(eeg: Any, expected_channels: int = 20) -> np.ndarray:
    arr = np.asarray(eeg, dtype=np.float64)
    if arr.ndim != 2:
        raise ValueError(f"EEG must be a 2-D matrix [samples x channels], got shape {arr.shape!r}.")
    if arr.shape[1] < expected_channels:
        raise ValueError(f"EEG has {arr.shape[1]} channels; expected at least {expected_channels}.")
    if arr.shape[0] < 2:
        raise ValueError("EEG must contain at least two samples.")
    return arr[:, :expected_channels]


def time_vector(sample_count: int, fs: float) -> np.ndarray:
    return np.arange(int(sample_count), dtype=np.float64) / float(fs)


def numpy_fft_bandpass(
    eeg: np.ndarray,
    fs: float,
    cfg: EEGAnalysisConfig,
    warnings: list[str] | None = None,
) -> np.ndarray:
    """Keep frequencies inside the selected EEG band using FFT masking."""
    arr = validate_eeg_matrix(eeg, cfg.analysis_column_count)
    sample_rate = float(fs)
    if sample_rate <= 0:
        raise ValueError("Sampling rate must be positive.")
    hp, lp = cfg.bandpass_limits(sample_rate)
    nyq = sample_rate / 2.0
    if hp <= 0 or lp >= nyq or hp >= lp:
        msg = f"Skipping bandpass filter because limits are invalid for fs={sample_rate}: {hp}-{lp} Hz."
        if warnings is not None:
            warnings.append(msg)
        return arr.copy()

    try:
        freqs = np.fft.rfftfreq(arr.shape[0], d=1.0 / sample_rate)
        spectrum = np.fft.rfft(arr, axis=0)
        keep = (freqs >= hp) & (freqs <= lp)
        spectrum[~keep, :] = 0.0
        return np.fft.irfft(spectrum, n=arr.shape[0], axis=0)
    except Exception as exc:  # noqa: BLE001
        msg = f"Bandpass filtering failed; continuing with unfiltered data. Details: {exc}"
        if warnings is not None:
            warnings.append(msg)
        return arr.copy()


def bandpass_filter(
    eeg: np.ndarray,
    fs: float,
    cfg: EEGAnalysisConfig,
    warnings: list[str] | None = None,
) -> np.ndarray:
    """Public wrapper kept for pipeline compatibility."""
    return numpy_fft_bandpass(eeg, fs, cfg, warnings)


def sample_bounds(start_s: float, end_s: float, fs: float, sample_count: int) -> tuple[int, int]:
    """Return zero-based [start, end) sample bounds clipped to the recording."""
    start = int(max(0, np.floor(float(start_s) * float(fs))))
    end = int(min(sample_count, np.floor(float(end_s) * float(fs))))
    return start, max(start, end)


def segment_by_seconds(eeg: np.ndarray, fs: float, start_s: float, end_s: float) -> tuple[np.ndarray, np.ndarray, tuple[int, int]]:
    start, end = sample_bounds(start_s, end_s, fs, eeg.shape[0])
    segment = eeg[start:end, :]
    t = np.arange(start, end, dtype=np.float64) / float(fs)
    return segment, t, (start, end)


def post_ignored_segment(eeg: np.ndarray, fs: float, ignored_initial_seconds: float) -> tuple[np.ndarray | None, np.ndarray | None, int]:
    """Return the segment after the configured initial skip period."""
    start_idx = int(np.floor(float(ignored_initial_seconds) * float(fs)))
    if start_idx >= eeg.shape[0]:
        return None, None, start_idx
    segment = eeg[start_idx:, :]
    t = np.arange(start_idx, eeg.shape[0], dtype=np.float64) / float(fs)
    return segment, t, start_idx
