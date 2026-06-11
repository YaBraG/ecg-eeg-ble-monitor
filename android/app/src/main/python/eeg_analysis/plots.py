"""Plotting helpers for non-interactive PNG output."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np

from .config import EEGAnalysisConfig
from .features import group_average, welch_psd


def ensure_plot_dirs(output_folder: str | Path) -> dict[str, Path]:
    root = Path(output_folder)
    key = root / "plots" / "key"
    all_dir = root / "plots" / "all"
    key.mkdir(parents=True, exist_ok=True)
    all_dir.mkdir(parents=True, exist_ok=True)
    return {"root": root, "key": key, "all": all_dir}


def rel_path(path: str | Path, root: str | Path) -> str:
    return Path(path).resolve().relative_to(Path(root).resolve()).as_posix()


def _downsample(t: np.ndarray, y: np.ndarray, max_points: int) -> tuple[np.ndarray, np.ndarray]:
    if t.size <= max_points:
        return t, y
    step = int(np.ceil(t.size / max_points))
    return t[::step], y[::step]


def _safe_name(text: str) -> str:
    keep = []
    for ch in str(text):
        if ch.isalnum() or ch in ("-", "_", "."):
            keep.append(ch)
        else:
            keep.append("_")
    return "".join(keep).strip("_") or "plot"


def _save(fig: plt.Figure, path: Path, cfg: EEGAnalysisConfig) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(path, dpi=int(cfg.plot_dpi), bbox_inches="tight")
    plt.close(fig)
    return str(path)


def numpy_stft_spectrogram(
    data: np.ndarray,
    fs: float,
    nperseg: int,
    noverlap: int,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Build a time-frequency preview from short FFT windows."""
    arr = np.asarray(data, dtype=np.float64).reshape(-1)
    sample_rate = float(fs)
    if arr.size < 2:
        freqs = np.fft.rfftfreq(max(1, arr.size), d=1.0 / sample_rate)
        return freqs, np.zeros(1, dtype=np.float64), np.zeros((freqs.size, 1), dtype=np.float64)

    nperseg_eff = int(min(max(16, nperseg), arr.size))
    noverlap_eff = int(min(max(0, noverlap), nperseg_eff - 1))
    step = max(1, nperseg_eff - noverlap_eff)
    starts = list(range(0, arr.size - nperseg_eff + 1, step))
    if not starts:
        starts = [0]
        nperseg_eff = arr.size
        noverlap_eff = 0

    window = np.hanning(nperseg_eff).astype(np.float64)
    window_power = float(np.sum(window * window)) or 1.0
    freqs = np.fft.rfftfreq(nperseg_eff, d=1.0 / sample_rate)
    times = (np.asarray(starts, dtype=np.float64) + nperseg_eff / 2.0) / sample_rate
    power = np.zeros((freqs.size, len(starts)), dtype=np.float64)

    for col, start in enumerate(starts):
        segment = arr[start : start + nperseg_eff]
        if segment.shape[0] < nperseg_eff:
            padded = np.zeros(nperseg_eff, dtype=np.float64)
            padded[: segment.shape[0]] = segment
            segment = padded
        segment = segment - np.nanmean(segment)
        segment = np.nan_to_num(segment, copy=False)
        spectrum = np.fft.rfft(segment * window)
        power[:, col] = (np.abs(spectrum) ** 2) / (sample_rate * window_power)

    if freqs.size > 2:
        power[1:-1, :] *= 2.0
    return freqs, times, power


def plot_recording_overview(
    eeg: np.ndarray,
    fs: float,
    ch_labels: list[str],
    output_dir: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
) -> str:
    """Key plot 1: recording overview with selected channels."""
    label_to_idx = {lbl.upper(): i for i, lbl in enumerate(ch_labels)}
    indices = [label_to_idx[lbl.upper()] for lbl in cfg.selected_overview_channels if lbl.upper() in label_to_idx]
    if not indices:
        indices = list(range(min(6, eeg.shape[1])))
    t = np.arange(eeg.shape[0], dtype=np.float64) / float(fs)
    fig, ax = plt.subplots(figsize=(12, 6))
    for offset, idx in enumerate(indices):
        y = eeg[:, idx]
        tt, yy = _downsample(t, y, cfg.max_plot_points)
        scale = np.nanstd(eeg[:, indices]) or 1.0
        ax.plot(tt, yy + offset * scale * 3.0, linewidth=0.7, label=ch_labels[idx])
    ax.set_title("Recording overview: selected EEG channels")
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Amplitude + vertical offset")
    ax.legend(loc="upper right", ncol=min(3, len(indices)))
    return rel_path(_save(fig, output_dir / "recording_overview_selected_channels.png", cfg), output_root)


def plot_stacked_timeseries(
    t: np.ndarray,
    data: np.ndarray,
    ch_labels: list[str],
    output_path: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
    title: str,
    max_channels: int | None = None,
) -> str:
    """Create a stacked time-domain plot for multiple channels."""
    arr = np.asarray(data)
    if max_channels is not None:
        arr = arr[:, :max_channels]
        labels = ch_labels[:max_channels]
    else:
        labels = ch_labels[: arr.shape[1]]
    fig, ax = plt.subplots(figsize=(13, 9))
    global_scale = np.nanstd(arr) or 1.0
    for i in range(arr.shape[1]):
        tt, yy = _downsample(t, arr[:, i], cfg.max_plot_points)
        ax.plot(tt, yy + i * global_scale * 3.0, linewidth=0.55)
    tick_positions = np.arange(arr.shape[1]) * global_scale * 3.0
    ax.set_yticks(tick_positions)
    ax.set_yticklabels(labels)
    ax.set_title(title)
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Channel")
    return rel_path(_save(fig, output_path, cfg), output_root)


def plot_time_domain_grid(
    t: np.ndarray,
    data: np.ndarray,
    ch_labels: list[str],
    output_dir: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
) -> str:
    """All-plot version: compact grid of each channel after the ignored period."""
    n_ch = min(data.shape[1], len(ch_labels))
    cols = 4
    rows = int(np.ceil(n_ch / cols))
    fig, axes = plt.subplots(rows, cols, figsize=(14, max(8, rows * 1.8)), sharex=True)
    axes_arr = np.asarray(axes).reshape(-1)
    for i in range(rows * cols):
        ax = axes_arr[i]
        if i >= n_ch:
            ax.axis("off")
            continue
        tt, yy = _downsample(t, data[:, i], max(2000, cfg.max_plot_points // 2))
        ax.plot(tt, yy, linewidth=0.5)
        ax.set_title(ch_labels[i], fontsize=8)
        ax.tick_params(labelsize=7)
    fig.suptitle("Post-270-second time-domain EEG by channel")
    return rel_path(_save(fig, output_dir / "post270_time_domain_channel_grid.png", cfg), output_root)


def plot_welch_psd(
    freqs: np.ndarray,
    psd: np.ndarray,
    ch_labels: list[str],
    output_dir: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
    filename: str = "welch_psd_per_channel.png",
    title: str = "Welch PSD per channel",
) -> str:
    fig, ax = plt.subplots(figsize=(12, 7))
    n_ch = min(psd.shape[1], len(ch_labels))
    max_freq = min(float(np.max(freqs)), 120.0)
    mask = freqs <= max_freq
    for i in range(n_ch):
        ax.semilogy(freqs[mask], psd[mask, i] + 1e-18, linewidth=0.65, label=ch_labels[i])
    ax.set_title(title)
    ax.set_xlabel("Frequency (Hz)")
    ax.set_ylabel("PSD")
    ax.grid(True, alpha=0.25)
    ax.legend(loc="upper right", ncol=4, fontsize=7)
    return rel_path(_save(fig, output_dir / filename, cfg), output_root)


def plot_bandpower_summary(
    bandpower: dict[str, np.ndarray],
    ch_labels: list[str],
    output_dir: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
) -> str:
    """Key plot 4: mean bandpower by band with per-channel spread."""
    bands = list(bandpower.keys())
    means = [float(np.nanmean(bandpower[b])) for b in bands]
    stds = [float(np.nanstd(bandpower[b])) for b in bands]
    fig, ax = plt.subplots(figsize=(9, 6))
    x = np.arange(len(bands))
    ax.bar(x, means, yerr=stds, capsize=4)
    ax.set_xticks(x)
    ax.set_xticklabels(bands, rotation=30, ha="right")
    ax.set_ylabel("Integrated PSD")
    ax.set_title("Bandpower summary: delta, theta, alpha, beta, gamma")
    return rel_path(_save(fig, output_dir / "bandpower_summary.png", cfg), output_root)


def plot_bandpower_heatmap(
    bandpower: dict[str, np.ndarray],
    ch_labels: list[str],
    output_dir: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
) -> str:
    bands = list(bandpower.keys())
    values = np.vstack([bandpower[b] for b in bands])
    fig, ax = plt.subplots(figsize=(12, 5))
    image = ax.imshow(values, aspect="auto")
    ax.set_yticks(np.arange(len(bands)))
    ax.set_yticklabels(bands)
    ax.set_xticks(np.arange(len(ch_labels)))
    ax.set_xticklabels(ch_labels, rotation=45, ha="right")
    ax.set_title("Bandpower by channel")
    cbar = fig.colorbar(image, ax=ax)
    cbar.set_label("Integrated PSD")
    return rel_path(_save(fig, output_dir / "bandpower_by_channel_heatmap.png", cfg), output_root)


def plot_group_time_event(
    t: np.ndarray,
    event_data: np.ndarray,
    group_a_idx: list[int],
    group_b_idx: list[int],
    output_dir: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
) -> str:
    group_a = group_average(event_data, group_a_idx)
    group_b = group_average(event_data, group_b_idx)
    tt, a = _downsample(t, group_a, cfg.max_plot_points)
    _, b = _downsample(t, group_b, cfg.max_plot_points)
    fig, ax = plt.subplots(figsize=(12, 5))
    ax.plot(tt, a, linewidth=0.8, label="Group A average")
    ax.plot(tt, b, linewidth=0.8, label="Group B average")
    ax.set_title("Group A vs Group B during demo event window")
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Amplitude")
    ax.legend()
    return rel_path(_save(fig, output_dir / "event_group_a_vs_b_time_domain.png", cfg), output_root)


def plot_group_psd_event(
    event_data: np.ndarray,
    fs: float,
    group_a_idx: list[int],
    group_b_idx: list[int],
    output_dir: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
) -> str:
    a = group_average(event_data, group_a_idx)
    b = group_average(event_data, group_b_idx)
    f_a, p_a = welch_psd(a, fs, cfg.welch_nperseg)
    f_b, p_b = welch_psd(b, fs, cfg.welch_nperseg)
    p_a = p_a[:, 0]
    p_b = p_b[:, 0]
    mask_a = f_a <= min(120.0, np.max(f_a))
    mask_b = f_b <= min(120.0, np.max(f_b))
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.semilogy(f_a[mask_a], p_a[mask_a] + 1e-18, linewidth=0.9, label="Group A average")
    ax.semilogy(f_b[mask_b], p_b[mask_b] + 1e-18, linewidth=0.9, label="Group B average")
    ax.set_title("Group A vs Group B PSD during demo event window")
    ax.set_xlabel("Frequency (Hz)")
    ax.set_ylabel("PSD")
    ax.grid(True, alpha=0.25)
    ax.legend()
    return rel_path(_save(fig, output_dir / "event_group_a_vs_b_psd.png", cfg), output_root)


def plot_time_frequency_group_averages(
    data: np.ndarray,
    t: np.ndarray,
    fs: float,
    group_a_idx: list[int],
    group_b_idx: list[int],
    output_dir: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
    filename: str = "time_frequency_group_averages.png",
) -> str:
    """Key plot 7: Group A/B time-frequency power preview."""
    a = group_average(data, group_a_idx)
    b = group_average(data, group_b_idx)
    nperseg = int(min(cfg.spectrogram_nperseg, max(32, a.shape[0] // 2)))
    noverlap = int(min(cfg.spectrogram_noverlap, max(0, nperseg - 1)))
    f_a, tt_a, s_a = numpy_stft_spectrogram(a, fs=float(fs), nperseg=nperseg, noverlap=noverlap)
    f_b, tt_b, s_b = numpy_stft_spectrogram(b, fs=float(fs), nperseg=nperseg, noverlap=noverlap)
    freq_mask_a = f_a <= min(80.0, np.max(f_a))
    freq_mask_b = f_b <= min(80.0, np.max(f_b))
    offset = float(t[0]) if t.size else 0.0
    fig, axes = plt.subplots(2, 1, figsize=(12, 8), sharex=True)
    im0 = axes[0].pcolormesh(tt_a + offset, f_a[freq_mask_a], 10.0 * np.log10(s_a[freq_mask_a, :] + 1e-18), shading="auto")
    axes[0].set_title("Group A time-frequency power")
    axes[0].set_ylabel("Frequency (Hz)")
    fig.colorbar(im0, ax=axes[0], label="dB")
    im1 = axes[1].pcolormesh(tt_b + offset, f_b[freq_mask_b], 10.0 * np.log10(s_b[freq_mask_b, :] + 1e-18), shading="auto")
    axes[1].set_title("Group B time-frequency power")
    axes[1].set_ylabel("Frequency (Hz)")
    axes[1].set_xlabel("Time (s)")
    fig.colorbar(im1, ax=axes[1], label="dB")
    return rel_path(_save(fig, output_dir / filename, cfg), output_root)


def plot_event_high_frequency_bandpower(
    high_frequency_bandpower: dict[str, tuple[float, float, float]],
    output_dir: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
) -> str:
    """All-plot: event high-frequency/ripple/fast-ripple summary for group averages."""
    names = list(high_frequency_bandpower.keys())
    group_a_vals = [float(high_frequency_bandpower[n][0]) for n in names]
    group_b_vals = [float(high_frequency_bandpower[n][1]) for n in names]
    x = np.arange(len(names))
    width = 0.35
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.bar(x - width / 2, group_a_vals, width, label="Group A")
    ax.bar(x + width / 2, group_b_vals, width, label="Group B")
    ax.set_xticks(x)
    ax.set_xticklabels(names, rotation=25, ha="right")
    ax.set_ylabel("Integrated PSD")
    ax.set_title("Event high-frequency bandpower: Group A vs Group B")
    ax.legend()
    return rel_path(_save(fig, output_dir / "event_high_frequency_bandpower.png", cfg), output_root)


def plot_window_label_timeline(
    labels: list[dict[str, Any]],
    event_window: dict[str, Any] | None,
    output_dir: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
) -> str:
    """All-plot: visual check for preictal/ictal/postictal window labels."""
    if not labels:
        raise ValueError("No labels available for the timeline plot.")
    label_order = {"unknown": 0, "preictal": 1, "ictal": 2, "postictal": 3}
    starts = [float(x["startSeconds"]) for x in labels]
    ends = [float(x["endSeconds"]) for x in labels]
    vals = [label_order.get(str(x["label"]), 0) for x in labels]
    fig, ax = plt.subplots(figsize=(12, 2.8))
    for start, end, val in zip(starts, ends, vals, strict=False):
        ax.plot([start, end], [val, val], linewidth=5)
    if event_window:
        onset = float(event_window.get("onsetSeconds", 0.0))
        offset = float(event_window.get("offsetSeconds", onset))
        ax.axvline(onset, linestyle="--", linewidth=1)
        ax.axvline(offset, linestyle="--", linewidth=1)
    ax.set_yticks(list(label_order.values()))
    ax.set_yticklabels(list(label_order.keys()))
    ax.set_xlabel("Time (s)")
    ax.set_title("Window labels for optional classifier section")
    return rel_path(_save(fig, output_dir / "window_label_timeline.png", cfg), output_root)
