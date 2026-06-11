"""Input loading utilities replacing the MATLAB TXT-to-MAT converter.

MATLAB source replaced:
    convert_txt_to_mat.m / convert_txt_to_mat.mlx

The Python version avoids writing MAT files. It returns the MATLAB-compatible
variables directly: EEG [N x 20], fs, channel labels, and metadata.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from .config import EEGAnalysisConfig


@dataclass(slots=True)
class RecordingData:
    eeg: np.ndarray
    fs: float
    ch_labels: list[str]
    metadata: dict[str, Any]
    all_columns: np.ndarray | None = None
    source_path: Path | None = None


def _as_float_matrix(data: np.ndarray) -> np.ndarray:
    arr = np.asarray(data, dtype=np.float64)
    if arr.ndim == 1:
        arr = arr.reshape(1, -1)
    if arr.ndim != 2:
        raise ValueError(f"Expected a 2-D numeric matrix, got shape {arr.shape!r}.")
    return arr


def find_recording_file(recording_folder_or_file: str | Path) -> Path:
    """Find one TXT recording from a supplied file or directory.

    The public API calls this so React Native/Chaquopy can pass either the file
    path copied into app storage or a folder containing the demo file.
    """
    path = Path(recording_folder_or_file).expanduser()
    if path.is_file():
        return path
    if not path.exists():
        raise FileNotFoundError(f"Recording path does not exist: {path}")
    txt_files = sorted(path.glob("*.txt"))
    if not txt_files:
        txt_files = sorted(path.rglob("*.txt"))
    if not txt_files:
        raise FileNotFoundError(f"No .txt recording files found in: {path}")
    return txt_files[0]


def load_txt_recording(
    recording_path: str | Path,
    cfg: EEGAnalysisConfig,
    fs: float | None = None,
    ch_labels: list[str] | None = None,
) -> RecordingData:
    """Read a whitespace-delimited numeric TXT file and keep columns 1-20.

    This preserves the MATLAB converter behavior:
    ``M = readmatrix(...); EEG = M(:, 1:20); fs = 500;``.
    """
    source_path = Path(recording_path).expanduser()
    if not source_path.exists():
        raise FileNotFoundError(f"Recording file does not exist: {source_path}")

    try:
        all_columns = np.loadtxt(source_path, dtype=np.float64)
    except Exception as exc:  # noqa: BLE001 - convert to a caller-facing message.
        raise ValueError(f"Could not read numeric TXT recording: {source_path}. {exc}") from exc

    all_columns = _as_float_matrix(all_columns)
    n_samples, n_cols = all_columns.shape
    if n_cols < cfg.analysis_column_count:
        raise ValueError(
            f"Recording has {n_cols} columns, but at least {cfg.analysis_column_count} are required."
        )
    if n_samples == 0:
        raise ValueError(f"Recording appears empty: {source_path}")

    sample_rate = float(fs if fs is not None else cfg.fs)
    labels = list(ch_labels if ch_labels is not None else cfg.channel_labels)
    if len(labels) != cfg.analysis_column_count:
        raise ValueError(
            f"Expected {cfg.analysis_column_count} channel labels, got {len(labels)}."
        )

    eeg = np.asarray(all_columns[:, : cfg.analysis_column_count], dtype=np.float64)
    duration = float(n_samples) / sample_rate
    metadata = {
        "filename": source_path.name,
        "sourcePath": str(source_path),
        "sampleCount": int(n_samples),
        "durationSeconds": duration,
        "sampleRateHz": sample_rate,
        "sourceColumnCount": int(n_cols),
        "analysisColumnCount": int(cfg.analysis_column_count),
        "sourceColumns": list(range(1, int(n_cols) + 1)),
        "analysisSourceColumns": list(range(1, int(cfg.analysis_column_count) + 1)),
        "protocolInfo": {
            "matlabStyleIgnoredInitialSeconds": cfg.ignored_initial_seconds,
            "eventLabel": cfg.event_label,
            "eventOnsetSeconds": cfg.event_onset_seconds,
            "eventOffsetSeconds": cfg.event_offset_seconds,
            "eventOffsetRule": "recording duration when event_offset_seconds is None",
        },
        "demoOnly": bool(cfg.demo_only),
    }
    return RecordingData(eeg=eeg, fs=sample_rate, ch_labels=labels, metadata=metadata, all_columns=all_columns, source_path=source_path)


def make_recording_from_array(
    eeg: Any,
    fs: float,
    ch_labels: list[str],
    cfg: EEGAnalysisConfig,
    metadata: dict[str, Any] | None = None,
    all_columns: Any | None = None,
) -> RecordingData:
    """Build a RecordingData object from MATLAB-compatible variables."""
    eeg_arr = _as_float_matrix(np.asarray(eeg, dtype=np.float64))
    n_samples, n_ch = eeg_arr.shape
    if n_ch < cfg.analysis_column_count:
        raise ValueError(
            f"EEG has {n_ch} columns/channels, but {cfg.analysis_column_count} are required."
        )
    if n_ch > cfg.analysis_column_count:
        eeg_arr = eeg_arr[:, : cfg.analysis_column_count]
    if len(ch_labels) != cfg.analysis_column_count:
        raise ValueError(
            f"Expected {cfg.analysis_column_count} channel labels, got {len(ch_labels)}."
        )

    all_cols_arr = None
    source_col_count = int(cfg.analysis_column_count)
    if all_columns is not None:
        all_cols_arr = _as_float_matrix(np.asarray(all_columns, dtype=np.float64))
        if all_cols_arr.shape[0] != n_samples:
            raise ValueError(
                "all_columns must have the same number of rows as EEG "
                f"({all_cols_arr.shape[0]} != {n_samples})."
            )
        if all_cols_arr.shape[1] < cfg.analysis_column_count:
            raise ValueError("all_columns must contain at least the first 20 EEG columns.")
        source_col_count = int(all_cols_arr.shape[1])

    sample_rate = float(fs)
    base_meta = dict(metadata or {})
    filename = str(base_meta.get("filename", "array_input"))
    duration = float(n_samples) / sample_rate if sample_rate > 0 else 0.0
    base_meta.update(
        {
            "filename": filename,
            "sampleCount": int(n_samples),
            "durationSeconds": duration,
            "sampleRateHz": sample_rate,
            "sourceColumnCount": source_col_count,
            "analysisColumnCount": int(cfg.analysis_column_count),
            "sourceColumns": list(range(1, source_col_count + 1)),
            "analysisSourceColumns": list(range(1, int(cfg.analysis_column_count) + 1)),
            "protocolInfo": base_meta.get(
                "protocolInfo",
                {
                    "matlabStyleIgnoredInitialSeconds": cfg.ignored_initial_seconds,
                    "eventLabel": cfg.event_label,
                    "eventOnsetSeconds": cfg.event_onset_seconds,
                    "eventOffsetSeconds": cfg.event_offset_seconds,
                    "eventOffsetRule": "recording duration when event_offset_seconds is None",
                },
            ),
            "demoOnly": bool(base_meta.get("demoOnly", cfg.demo_only)),
        }
    )
    return RecordingData(eeg=eeg_arr, fs=sample_rate, ch_labels=list(ch_labels), metadata=base_meta, all_columns=all_cols_arr, source_path=None)
