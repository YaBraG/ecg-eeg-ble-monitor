"""PCA/ICA replacements for the MATLAB Group A/B event section.

MATLAB source replaced:
    pca_ica_groupAB_from_groupBbaseline and combined PCA/ICA sections.

For Android dependency control, PCA is implemented with NumPy SVD. ICA is not
run by default because MATLAB's fastica would require a heavier optional Python
stack. The pipeline records this as a simplification rather than failing.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np

from .config import EEGAnalysisConfig
from .plots import rel_path


def compute_pca_svd(data: np.ndarray) -> dict[str, np.ndarray]:
    """Compute PCA using centered SVD.

    Input shape is [samples x channels]. Output loadings shape is
    [channels x components].
    """
    x = np.asarray(data, dtype=np.float64)
    if x.ndim != 2:
        raise ValueError("PCA input must be 2-D [samples x channels].")
    if x.shape[0] < 2 or x.shape[1] < 2:
        raise ValueError("PCA requires at least two samples and two channels.")
    x_centered = x - np.nanmean(x, axis=0, keepdims=True)
    x_centered = np.nan_to_num(x_centered, copy=False)
    u, s, vt = np.linalg.svd(x_centered, full_matrices=False)
    denom = max(1, x.shape[0] - 1)
    eigenvalues = (s**2) / denom
    total = float(np.sum(eigenvalues))
    explained = eigenvalues / total if total > 0 else np.zeros_like(eigenvalues)
    return {
        "scores": u * s,
        "loadings": vt.T,
        "eigenvalues": eigenvalues,
        "explainedVarianceRatio": explained,
        "singularValues": s,
    }


def _save(fig: plt.Figure, path: Path, cfg: EEGAnalysisConfig) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(path, dpi=int(cfg.plot_dpi), bbox_inches="tight")
    plt.close(fig)
    return str(path)


def _prepare_group_pca_inputs(
    eeg: np.ndarray,
    fs: float,
    event_window: dict[str, Any],
    group_a_idx: list[int],
    group_b_idx: list[int],
) -> tuple[np.ndarray, np.ndarray]:
    onset = float(event_window["onsetSeconds"])
    offset = float(event_window["offsetSeconds"])
    start = int(max(0, np.floor(onset * float(fs))))
    end = int(min(eeg.shape[0], np.floor(offset * float(fs))))
    if end <= start:
        raise ValueError("Event epoch is empty after clipping.")
    event = eeg[start:end, :]
    pre_end = max(0, start)
    pre = eeg[:pre_end, :] if pre_end > 0 else eeg
    baseline_pool_idx = group_a_idx + group_b_idx
    baseline_scalar = float(np.nanmean(pre[:, baseline_pool_idx])) if baseline_pool_idx else 0.0
    group_a = event[:, group_a_idx] - baseline_scalar
    group_b = event[:, group_b_idx] - baseline_scalar
    group_a = group_a - np.nanmean(group_a, axis=0, keepdims=True)
    group_b = group_b - np.nanmean(group_b, axis=0, keepdims=True)
    return group_a, group_b


def make_pca_plots(
    eeg: np.ndarray,
    fs: float,
    event_window: dict[str, Any] | None,
    ch_labels: list[str],
    group_a_idx: list[int],
    group_b_idx: list[int],
    output_key_dir: Path,
    output_all_dir: Path,
    output_root: Path,
    cfg: EEGAnalysisConfig,
    warnings: list[str],
) -> tuple[list[str], list[str], dict[str, Any]]:
    """Create PCA plots and return (key_paths, all_paths, json_summary)."""
    if not event_window:
        warnings.append("PCA plots skipped: no demo event window was available for this recording.")
        return [], [], {}
    if len(group_a_idx) < 2 or len(group_b_idx) < 2:
        warnings.append("PCA plots skipped: Group A and Group B each need at least two channels.")
        return [], [], {}

    try:
        group_a, group_b = _prepare_group_pca_inputs(eeg, fs, event_window, group_a_idx, group_b_idx)
        pca_a = compute_pca_svd(group_a)
        pca_b = compute_pca_svd(group_b)
    except Exception as exc:  # noqa: BLE001
        warnings.append(f"PCA plots skipped: {exc}")
        return [], [], {}

    group_a_labels = [ch_labels[i] for i in group_a_idx]
    group_b_labels = [ch_labels[i] for i in group_b_idx]

    # Key plot: PC1 loadings / dominant electrodes for each group.
    fig, axes = plt.subplots(2, 1, figsize=(11, 8), sharex=False)
    dominant: dict[str, Any] = {}
    for ax, pca, labels, title, key in [
        (axes[0], pca_a, group_a_labels, "Group A PC1 loadings", "groupA"),
        (axes[1], pca_b, group_b_labels, "Group B PC1 loadings", "groupB"),
    ]:
        loadings = np.asarray(pca["loadings"][:, 0])
        order = np.argsort(np.abs(loadings))[::-1]
        ax.bar(np.arange(len(labels)), loadings)
        ax.set_xticks(np.arange(len(labels)))
        ax.set_xticklabels(labels, rotation=45, ha="right")
        ax.set_ylabel("PC1 loading")
        ax.set_title(title)
        top = [labels[int(i)] for i in order[: min(3, len(order))]]
        dominant[key] = {
            "topPc1Electrodes": top,
            "explainedVariancePc1": float(np.asarray(pca["explainedVarianceRatio"])[0]),
        }
    key_path = rel_path(_save(fig, output_key_dir / "pca_loadings_dominant_electrodes.png", cfg), output_root)

    all_paths: list[str] = []

    # All plot: variance explained.
    fig, ax = plt.subplots(figsize=(10, 5))
    comp_a = np.arange(1, len(pca_a["explainedVarianceRatio"]) + 1)
    comp_b = np.arange(1, len(pca_b["explainedVarianceRatio"]) + 1)
    ax.plot(comp_a, 100.0 * pca_a["explainedVarianceRatio"], marker="o", label="Group A")
    ax.plot(comp_b, 100.0 * pca_b["explainedVarianceRatio"], marker="o", label="Group B")
    ax.set_xlabel("Principal component")
    ax.set_ylabel("Variance explained (%)")
    ax.set_title("PCA variance explained")
    ax.legend()
    all_paths.append(rel_path(_save(fig, output_all_dir / "pca_variance_explained.png", cfg), output_root))

    # All plot: PC1 vs PC2 scores, downsampled for figure size.
    fig, ax = plt.subplots(figsize=(8, 6))
    for pca, label in [(pca_a, "Group A"), (pca_b, "Group B")]:
        scores = pca["scores"]
        if scores.shape[1] < 2:
            continue
        step = max(1, int(np.ceil(scores.shape[0] / cfg.max_plot_points)))
        ax.scatter(scores[::step, 0], scores[::step, 1], s=4, alpha=0.35, label=label)
    ax.set_xlabel("PC1 score")
    ax.set_ylabel("PC2 score")
    ax.set_title("Event PCA scores")
    ax.legend()
    all_paths.append(rel_path(_save(fig, output_all_dir / "pca_scores_pc1_pc2.png", cfg), output_root))

    dominant["ica"] = {
        "enabled": bool(cfg.enable_ica),
        "status": "skipped",
        "reason": "disabled_by_default_for_android" if not cfg.enable_ica else "FastICA not included in lightweight package",
    }
    if cfg.enable_ica:
        warnings.append("ICA plots skipped: FastICA implementation is not included in the lightweight Android package.")

    return [key_path], all_paths, dominant
