"""Feature extraction and window-label helpers for the EEG demo pipeline."""

from __future__ import annotations

from typing import Any

import numpy as np

from .config import EEGAnalysisConfig


def integrate_trapezoid(y: np.ndarray, x: np.ndarray | None = None, axis: int = -1) -> np.ndarray:
    """Integrate with the available NumPy trapezoid function."""
    trapezoid = getattr(np, "trapezoid", None)
    if trapezoid is not None:
        return trapezoid(y, x=x, axis=axis)
    return np.trapz(y, x=x, axis=axis)


def group_indices(channel_labels: list[str], group_labels: list[str], warnings: list[str] | None = None, group_name: str = "group") -> list[int]:
    """Map channel labels to zero-based indices."""
    label_to_idx = {str(label).upper(): idx for idx, label in enumerate(channel_labels)}
    indices: list[int] = []
    missing: list[str] = []
    for label in group_labels:
        idx = label_to_idx.get(label.upper())
        if idx is None:
            missing.append(label)
        else:
            indices.append(idx)
    if missing and warnings is not None:
        warnings.append(f"Missing {group_name} channel labels: {', '.join(missing)}")
    return indices


def welch_psd(data: np.ndarray, fs: float, nperseg: int = 2048) -> tuple[np.ndarray, np.ndarray]:
    """Estimate PSD with overlapping Hann-window FFTs."""
    arr = np.asarray(data, dtype=np.float64)
    if arr.ndim == 1:
        arr = arr[:, None]
    if arr.ndim != 2:
        raise ValueError(f"PSD input must be 1-D or 2-D, got shape {arr.shape!r}.")
    if arr.shape[0] < 2:
        freqs = np.fft.rfftfreq(max(1, arr.shape[0]), d=1.0 / float(fs))
        return freqs, np.zeros((freqs.size, arr.shape[1]), dtype=np.float64)

    sample_rate = float(fs)
    nperseg_eff = int(min(max(16, nperseg), arr.shape[0]))
    noverlap = nperseg_eff // 2
    step = max(1, nperseg_eff - noverlap)
    starts = list(range(0, arr.shape[0] - nperseg_eff + 1, step))
    if not starts:
        starts = [0]
        nperseg_eff = arr.shape[0]

    window = np.hanning(nperseg_eff).astype(np.float64)
    window_power = float(np.sum(window * window)) or 1.0
    freqs = np.fft.rfftfreq(nperseg_eff, d=1.0 / sample_rate)
    psd_accum = np.zeros((freqs.size, arr.shape[1]), dtype=np.float64)

    for start in starts:
        segment = arr[start : start + nperseg_eff, :]
        if segment.shape[0] < nperseg_eff:
            padded = np.zeros((nperseg_eff, arr.shape[1]), dtype=np.float64)
            padded[: segment.shape[0], :] = segment
            segment = padded
        segment = segment - np.nanmean(segment, axis=0, keepdims=True)
        segment = np.nan_to_num(segment, copy=False)
        spectrum = np.fft.rfft(segment * window[:, None], axis=0)
        psd_accum += (np.abs(spectrum) ** 2) / (sample_rate * window_power)

    psd = psd_accum / float(len(starts))
    if freqs.size > 2:
        psd[1:-1, :] *= 2.0
    return freqs, psd


def integrate_bandpower(freqs: np.ndarray, psd: np.ndarray, band: tuple[float, float]) -> np.ndarray:
    """Integrate PSD over a frequency band for each channel."""
    low, high = float(band[0]), float(band[1])
    mask = (freqs >= low) & (freqs < high)
    if not np.any(mask):
        return np.zeros(psd.shape[1], dtype=np.float64)
    return integrate_trapezoid(psd[mask, :], freqs[mask], axis=0)


def bandpower_by_channel(
    data: np.ndarray,
    fs: float,
    bands_hz: dict[str, tuple[float, float]],
    nperseg: int = 2048,
) -> tuple[np.ndarray, np.ndarray, dict[str, np.ndarray]]:
    freqs, psd = welch_psd(data, fs, nperseg=nperseg)
    out = {name: integrate_bandpower(freqs, psd, tuple(band)) for name, band in bands_hz.items()}
    return freqs, psd, out


def bandpower_summary_json(
    bandpower: dict[str, np.ndarray],
    channel_labels: list[str],
) -> dict[str, Any]:
    """Small JSON-serializable bandpower summary for the app/debug UI."""
    summary: dict[str, Any] = {}
    for band, values in bandpower.items():
        arr = np.asarray(values, dtype=np.float64)
        if arr.size == 0:
            summary[band] = {"mean": 0.0, "maxChannel": None, "maxValue": 0.0}
            continue
        max_idx = int(np.nanargmax(arr))
        summary[band] = {
            "mean": float(np.nanmean(arr)),
            "median": float(np.nanmedian(arr)),
            "maxChannel": channel_labels[max_idx] if max_idx < len(channel_labels) else str(max_idx),
            "maxValue": float(arr[max_idx]),
        }
    return summary


def group_average(data: np.ndarray, indices: list[int]) -> np.ndarray:
    if not indices:
        return np.zeros(data.shape[0], dtype=np.float64)
    return np.nanmean(data[:, indices], axis=1)


def event_epoch(
    eeg: np.ndarray,
    fs: float,
    event_window: dict[str, Any] | None,
) -> tuple[np.ndarray | None, np.ndarray | None, tuple[int, int] | None]:
    if not event_window:
        return None, None, None
    onset = float(event_window.get("onsetSeconds", 0.0))
    offset = float(event_window.get("offsetSeconds", onset))
    start = int(max(0, np.floor(onset * float(fs))))
    end = int(min(eeg.shape[0], np.floor(offset * float(fs))))
    if end <= start:
        return None, None, (start, end)
    return eeg[start:end, :], np.arange(start, end, dtype=np.float64) / float(fs), (start, end)


def window_labels(
    sample_count: int,
    fs: float,
    event_window: dict[str, Any] | None,
    ignored_initial_seconds: float = 270.0,
    window_seconds: float = 2.0,
) -> list[dict[str, Any]]:
    """Label fixed windows as preictal/ictal/postictal/unknown.

    The labels are useful for summaries and optional classifier inputs.
    """
    start = int(max(0, np.floor(float(ignored_initial_seconds) * float(fs))))
    win = max(1, int(round(float(window_seconds) * float(fs))))
    labels: list[dict[str, Any]] = []
    if start >= sample_count:
        return labels
    onset = None
    offset = None
    if event_window:
        onset = float(event_window.get("onsetSeconds", 0.0))
        offset = float(event_window.get("offsetSeconds", 0.0))
    idx = start
    while idx < sample_count:
        end = min(sample_count, idx + win)
        center_s = ((idx + end) / 2.0) / float(fs)
        if onset is None or offset is None:
            label = "unknown"
        elif center_s < onset:
            label = "preictal"
        elif center_s <= offset:
            label = "ictal"
        else:
            label = "postictal"
        labels.append(
            {
                "startSample": int(idx),
                "endSampleExclusive": int(end),
                "startSeconds": float(idx / float(fs)),
                "endSeconds": float(end / float(fs)),
                "label": label,
            }
        )
        idx = end
    return labels


def window_feature_matrix(
    eeg: np.ndarray,
    fs: float,
    labels: list[dict[str, Any]],
    cfg: EEGAnalysisConfig,
) -> tuple[np.ndarray, list[str]]:
    """Extract simple windowed bandpower features for optional classifier demos."""
    rows: list[list[float]] = []
    y: list[str] = []
    for win in labels:
        start = int(win["startSample"])
        end = int(win["endSampleExclusive"])
        segment = eeg[start:end, :]
        if segment.shape[0] < 16:
            continue
        _, _, bp = bandpower_by_channel(segment, fs, cfg.bands_hz, nperseg=cfg.welch_nperseg)
        rows.append([float(np.nanmean(v)) for v in bp.values()])
        y.append(str(win["label"]))
    if not rows:
        return np.empty((0, len(cfg.bands_hz))), []
    return np.asarray(rows, dtype=np.float64), y
