"""Public API for the Android-friendly EEG demo pipeline.

The app should call one of these functions:

    run_analysis(recording_folder_or_file, output_folder, config=None)
    run_analysis_from_array(EEG, fs, ch_labels, output_folder, metadata=None, all_columns=None, config=None)

Both return a JSON-serializable dict and write analysis_summary.json plus PNGs.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np

from .config import EEGAnalysisConfig
from .export import make_debug_export_zip, to_jsonable, write_json
from .features import (
    bandpower_by_channel,
    bandpower_summary_json,
    event_epoch,
    group_average,
    group_indices,
    integrate_bandpower,
    welch_psd,
    window_feature_matrix,
    window_labels,
)
from .io import RecordingData, find_recording_file, load_txt_recording, make_recording_from_array
from .pca_ica import make_pca_plots
from .plots import (
    ensure_plot_dirs,
    plot_bandpower_heatmap,
    plot_bandpower_summary,
    plot_event_high_frequency_bandpower,
    plot_group_psd_event,
    plot_group_time_event,
    plot_recording_overview,
    plot_stacked_timeseries,
    plot_time_domain_grid,
    plot_time_frequency_group_averages,
    plot_welch_psd,
    plot_window_label_timeline,
)
from .preprocessing import bandpass_filter, post_ignored_segment, validate_eeg_matrix


_SAFE_RESULT_MESSAGE = "No seizure-like activity was detected in this recording."
_DISCLAIMER = "This result is not a medical diagnosis and should be reviewed by a qualified clinician."


def _fs_json_value(fs: float) -> int | float:
    fs_float = float(fs)
    if abs(fs_float - round(fs_float)) < 1e-9:
        return int(round(fs_float))
    return fs_float


def _failure_summary(output_folder: str | Path, message: str, warnings: list[str] | None = None) -> dict[str, Any]:
    root = Path(output_folder)
    root.mkdir(parents=True, exist_ok=True)
    summary = {
        "analysisComplete": False,
        "demoOnly": True,
        "sampleRateHz": None,
        "sampleCount": 0,
        "channelCount": 0,
        "durationSeconds": 0.0,
        "sourceColumnCount": 0,
        "analysisColumnCount": 20,
        "channelOrder": [],
        "assumptions": [],
        "seizureLikeActivityDetected": False,
        "resultMessage": f"Analysis could not be completed: {message}",
        "disclaimer": _DISCLAIMER,
        "keyPlots": [],
        "allPlots": [],
        "warnings": list(warnings or []) + [message],
    }
    write_json(root / "analysis_summary.json", summary)
    return summary


def _add_unique(paths: list[str], new_path: str | None) -> None:
    if new_path and new_path not in paths:
        paths.append(new_path)


def _event_summary_and_warnings(
    cfg: EEGAnalysisConfig,
    metadata: dict[str, Any],
    sample_count: int,
    fs: float,
    warnings: list[str],
) -> dict[str, Any] | None:
    duration_s = float(sample_count) / float(fs)
    if duration_s <= float(cfg.event_onset_seconds):
        warnings.append(
            "Event/ictal analysis skipped: recording duration "
            f"({duration_s:.3f} s) is shorter than event onset "
            f"({float(cfg.event_onset_seconds):.3f} s)."
        )
        return None

    event_window = cfg.resolve_event_window(sample_count, fs)
    if float(event_window["durationSeconds"]) <= 0.0:
        warnings.append("Event/ictal analysis skipped: configured event window is empty after clipping.")
        return None

    if event_window.get("wasClippedToRecordingDuration"):
        warnings.append(
            "Event offset was clipped to recording duration: requested "
            f"{float(event_window['requestedOffsetSeconds']):.3f} s, available {duration_s:.3f} s."
        )
    return event_window


def _compute_event_high_frequency_summary(
    event_data: np.ndarray,
    fs: float,
    group_a_idx: list[int],
    group_b_idx: list[int],
    cfg: EEGAnalysisConfig,
) -> dict[str, tuple[float, float, float]]:
    """Return band -> (Group A power, Group B power, ratio A/B)."""
    if event_data.size == 0 or not group_a_idx or not group_b_idx:
        return {}
    a = group_average(event_data, group_a_idx)[:, None]
    b = group_average(event_data, group_b_idx)[:, None]
    f_a, p_a = welch_psd(a, fs, cfg.welch_nperseg)
    f_b, p_b = welch_psd(b, fs, cfg.welch_nperseg)
    nyq = fs / 2.0
    summary: dict[str, tuple[float, float, float]] = {}
    for name, (low, high) in cfg.high_frequency_bands_hz.items():
        if low >= nyq:
            continue
        clipped = (float(low), min(float(high), nyq - 1e-6))
        a_power = float(integrate_bandpower(f_a, p_a, clipped)[0])
        b_power = float(integrate_bandpower(f_b, p_b, clipped)[0])
        ratio = float(a_power / b_power) if b_power > 0 else float("inf")
        summary[name] = (a_power, b_power, ratio)
    return summary


def _optional_classifier_step(
    eeg_filtered: np.ndarray,
    fs: float,
    event_window: dict[str, Any] | None,
    cfg: EEGAnalysisConfig,
    output_all_dir: Path,
    output_root: Path,
    warnings: list[str],
    all_plots: list[str],
) -> dict[str, Any]:
    labels = window_labels(
        sample_count=eeg_filtered.shape[0],
        fs=fs,
        event_window=event_window,
        ignored_initial_seconds=cfg.ignored_initial_seconds,
    )
    label_counts: dict[str, int] = {}
    for item in labels:
        label = str(item.get("label", "unknown"))
        label_counts[label] = label_counts.get(label, 0) + 1
    if labels:
        try:
            _add_unique(
                all_plots,
                plot_window_label_timeline(labels, event_window, output_all_dir, output_root, cfg),
            )
        except Exception as exc:  # noqa: BLE001
            warnings.append(f"Window label timeline plot skipped: {exc}")

    if not cfg.enable_classifier:
        return {"enabled": False, "windowLabelCounts": label_counts}

    _, y = window_feature_matrix(eeg_filtered, fs, labels, cfg)
    classes = sorted(set(y) - {"unknown"})
    if len(classes) <= 1:
        warnings.append(
            "Classifier plots skipped: only one labeled class was present after windowing, matching MATLAB behavior."
        )
        return {"enabled": True, "trained": False, "reason": "only_one_class", "windowLabelCounts": label_counts}

    warnings.append(
        "Classifier training was not run in this lightweight Android package; window labels/features are prepared only."
    )
    return {"enabled": True, "trained": False, "reason": "classifier_omitted_for_android_demo", "windowLabelCounts": label_counts}


def _run_core(recording: RecordingData, output_folder: str | Path, cfg: EEGAnalysisConfig) -> dict[str, Any]:
    root = Path(output_folder)
    root.mkdir(parents=True, exist_ok=True)
    dirs = ensure_plot_dirs(root)
    output_key_dir = dirs["key"]
    output_all_dir = dirs["all"]
    output_root = dirs["root"]

    warnings: list[str] = []
    key_plots: list[str] = []
    all_plots: list[str] = []

    eeg = validate_eeg_matrix(recording.eeg, cfg.analysis_column_count)
    fs = float(recording.fs)
    ch_labels = list(recording.ch_labels)
    sample_count = int(eeg.shape[0])
    channel_count = int(eeg.shape[1])
    duration_s = float(sample_count) / fs if fs > 0 else 0.0
    metadata = dict(recording.metadata)
    metadata.update(
        {
            "sampleCount": sample_count,
            "durationSeconds": duration_s,
            "sampleRateHz": fs,
            "analysisColumnCount": cfg.analysis_column_count,
            "channelOrder": ch_labels,
        }
    )
    source_column_count = int(metadata.get("sourceColumnCount", recording.all_columns.shape[1] if recording.all_columns is not None else channel_count))

    event_window = _event_summary_and_warnings(cfg, metadata, sample_count, fs, warnings)

    # Keep frequencies inside the selected EEG band.
    eeg_filtered = bandpass_filter(eeg, fs, cfg, warnings)
    hp, lp = cfg.bandpass_limits(fs)

    # Group definitions are centralized in config.py.
    group_a_idx = group_indices(ch_labels, cfg.group_a_labels, warnings, "Group A")
    group_b_idx = group_indices(ch_labels, cfg.group_b_labels, warnings, "Group B")

    # Key plot 1: always try a full-recording overview.
    try:
        _add_unique(key_plots, plot_recording_overview(eeg_filtered, fs, ch_labels, output_key_dir, output_root, cfg))
    except Exception as exc:  # noqa: BLE001
        warnings.append(f"Recording overview plot skipped: {exc}")

    post_data, post_t, ignored_start_idx = post_ignored_segment(eeg_filtered, fs, cfg.ignored_initial_seconds)
    post_ignore_feature_summary: dict[str, Any] = {}
    if post_data is None or post_t is None:
        warnings.append(
            "MATLAB-style post-270-second analysis skipped: recording is shorter than "
            f"{cfg.ignored_initial_seconds:.1f} seconds."
        )
    else:
        try:
            _add_unique(
                key_plots,
                plot_stacked_timeseries(
                    post_t,
                    post_data,
                    ch_labels,
                    output_key_dir / "post270_20_channel_time_domain.png",
                    output_root,
                    cfg,
                    title="20-channel time-domain EEG after first 270 seconds",
                ),
            )
            _add_unique(all_plots, plot_time_domain_grid(post_t, post_data, ch_labels, output_all_dir, output_root, cfg))
        except Exception as exc:  # noqa: BLE001
            warnings.append(f"Post-270-second time-domain plots skipped: {exc}")

        try:
            freqs, psd, bandpower = bandpower_by_channel(post_data, fs, cfg.bands_hz, cfg.welch_nperseg)
            post_ignore_feature_summary["bandpower"] = bandpower_summary_json(bandpower, ch_labels)
            _add_unique(key_plots, plot_welch_psd(freqs, psd, ch_labels, output_key_dir, output_root, cfg))
            _add_unique(key_plots, plot_bandpower_summary(bandpower, ch_labels, output_key_dir, output_root, cfg))
            _add_unique(all_plots, plot_bandpower_heatmap(bandpower, ch_labels, output_all_dir, output_root, cfg))
        except Exception as exc:  # noqa: BLE001
            warnings.append(f"PSD/bandpower plots skipped: {exc}")

        try:
            if group_a_idx and group_b_idx:
                _add_unique(
                    key_plots,
                    plot_time_frequency_group_averages(
                        post_data,
                        post_t,
                        fs,
                        group_a_idx,
                        group_b_idx,
                        output_key_dir,
                        output_root,
                        cfg,
                    ),
                )
            else:
                warnings.append("Time-frequency plot skipped: Group A/B channel mapping was incomplete.")
        except Exception as exc:  # noqa: BLE001
            warnings.append(f"Time-frequency plot skipped: {exc}")

    event_feature_summary: dict[str, Any] = {}
    if event_window is not None and duration_s > float(event_window.get("onsetSeconds", 0.0)):
        event_data, event_t, event_bounds = event_epoch(eeg_filtered, fs, event_window)
        if event_data is None or event_t is None or event_bounds is None:
            warnings.append("Event/ictal analysis skipped: event epoch was empty after clipping.")
        elif not group_a_idx or not group_b_idx:
            warnings.append("Event/ictal Group A vs Group B plots skipped: Group A/B channel mapping was incomplete.")
        else:
            try:
                _add_unique(key_plots, plot_group_time_event(event_t, event_data, group_a_idx, group_b_idx, output_key_dir, output_root, cfg))
            except Exception as exc:  # noqa: BLE001
                warnings.append(f"Group A/B event time-domain plot skipped: {exc}")
            try:
                _add_unique(key_plots, plot_group_psd_event(event_data, fs, group_a_idx, group_b_idx, output_key_dir, output_root, cfg))
            except Exception as exc:  # noqa: BLE001
                warnings.append(f"Group A/B event PSD plot skipped: {exc}")
            try:
                event_hf = _compute_event_high_frequency_summary(event_data, fs, group_a_idx, group_b_idx, cfg)
                event_feature_summary["highFrequencyGroupBandpower"] = {
                    k: {"groupA": v[0], "groupB": v[1], "groupAToGroupBRatio": v[2]} for k, v in event_hf.items()
                }
                if event_hf:
                    _add_unique(
                        all_plots,
                        plot_event_high_frequency_bandpower(event_hf, output_all_dir, output_root, cfg),
                    )
            except Exception as exc:  # noqa: BLE001
                warnings.append(f"Event high-frequency bandpower plot skipped: {exc}")
            try:
                pca_key, pca_all, pca_summary = make_pca_plots(
                    eeg_filtered,
                    fs,
                    event_window,
                    ch_labels,
                    group_a_idx,
                    group_b_idx,
                    output_key_dir,
                    output_all_dir,
                    output_root,
                    cfg,
                    warnings,
                )
                for path in pca_key:
                    _add_unique(key_plots, path)
                for path in pca_all:
                    _add_unique(all_plots, path)
                if pca_summary:
                    event_feature_summary["pcaDominantElectrodes"] = pca_summary
            except Exception as exc:  # noqa: BLE001
                warnings.append(f"PCA plots skipped: {exc}")

    classifier_summary = _optional_classifier_step(eeg_filtered, fs, event_window, cfg, output_all_dir, output_root, warnings, all_plots)

    summary: dict[str, Any] = {
        "analysisComplete": True,
        "demoOnly": bool(cfg.demo_only),
        "sampleRateHz": _fs_json_value(fs),
        "sampleCount": sample_count,
        "channelCount": channel_count,
        "durationSeconds": duration_s,
        "sourceColumnCount": source_column_count,
        "analysisColumnCount": int(cfg.analysis_column_count),
        "channelOrder": ch_labels,
        "assumptions": list(cfg.assumptions),
        "seizureLikeActivityDetected": False,
        "resultMessage": _SAFE_RESULT_MESSAGE,
        "disclaimer": _DISCLAIMER,
        "keyPlots": key_plots,
        "allPlots": all_plots,
        "warnings": warnings,
        "metadata": metadata,
        "eventWindow": event_window,
        "filter": {
            "filterMethod": "numpy_fft_bandpass_mobile_demo",
            "highpassHz": hp,
            "lowpassHz": lp,
            "mobileDemoReplacement": True,
            "clinicalGrade": False,
        },
        "matlabStyleIgnoredInitialSeconds": cfg.ignored_initial_seconds,
        "ignoredInitialSampleCount": int(ignored_start_idx),
        "features": {
            "postIgnored": post_ignore_feature_summary,
            "event": event_feature_summary,
            "classifier": classifier_summary,
        },
    }

    if cfg.create_debug_export:
        try:
            export_zip = make_debug_export_zip(
                output_folder=root,
                summary=summary,
                metadata=metadata,
                all_columns=recording.all_columns,
                source_path=recording.source_path,
                copy_source_txt=cfg.copy_source_txt_to_export,
            )
            summary["exportZip"] = export_zip
        except Exception as exc:  # noqa: BLE001
            warnings.append(f"Debug export ZIP could not be created: {exc}")
            summary["exportZip"] = None

    # Re-write after the export path and any export warning have been added.
    write_json(root / "analysis_summary.json", summary)
    return to_jsonable(summary)


def run_analysis(recording_folder: str, output_folder: str, config: dict | None = None) -> dict:
    """Run the demo analysis from a TXT recording file or folder.

    Parameters
    ----------
    recording_folder:
        Either a path to a whitespace-delimited numeric TXT file or a directory
        containing one.
    output_folder:
        Destination folder for analysis_summary.json, plots, and export ZIP.
    config:
        Optional dict overriding values in EEGAnalysisConfig.
    """
    cfg = EEGAnalysisConfig.from_dict(config)
    try:
        recording_path = find_recording_file(recording_folder)
        recording = load_txt_recording(recording_path, cfg)
        return _run_core(recording, output_folder, cfg)
    except Exception as exc:  # noqa: BLE001
        return _failure_summary(output_folder, str(exc))


def run_analysis_from_array(
    EEG: Any,
    fs: float,
    ch_labels: list[str],
    output_folder: str,
    metadata: dict | None = None,
    all_columns: Any | None = None,
    config: dict | None = None,
) -> dict:
    """Run the demo analysis from an in-memory EEG array.

    Use this when the caller already has samples, labels, and metadata loaded.
    """
    cfg = EEGAnalysisConfig.from_dict(config)
    try:
        recording = make_recording_from_array(EEG, fs, ch_labels, cfg, metadata=metadata, all_columns=all_columns)
        return _run_core(recording, output_folder, cfg)
    except Exception as exc:  # noqa: BLE001
        return _failure_summary(output_folder, str(exc))
