"""Summary and debug export utilities for the mobile demo."""

from __future__ import annotations

import json
import shutil
import tempfile
import zipfile
from pathlib import Path
from typing import Any

import numpy as np


def to_jsonable(value: Any) -> Any:
    """Recursively convert NumPy/scalar/path values into JSON-safe values."""
    if isinstance(value, dict):
        return {str(k): to_jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_jsonable(v) for v in value]
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    if isinstance(value, (np.bool_,)):
        return bool(value)
    if isinstance(value, Path):
        return str(value)
    return value


def write_json(path: str | Path, payload: dict[str, Any]) -> None:
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        json.dump(to_jsonable(payload), f, indent=2, sort_keys=False)


def make_debug_export_zip(
    output_folder: str | Path,
    summary: dict[str, Any],
    metadata: dict[str, Any],
    all_columns: np.ndarray | None,
    source_path: str | Path | None = None,
    copy_source_txt: bool = False,
) -> str:
    """Create an export ZIP with summary, metadata, all columns, and plots.

    The ZIP is intended for demo/debug use. It does not imply clinical validity.
    """
    root = Path(output_folder)
    export_dir = root / "exports"
    export_dir.mkdir(parents=True, exist_ok=True)
    zip_path = export_dir / "debug_export_package.zip"

    with tempfile.TemporaryDirectory() as tmpdir_str:
        tmpdir = Path(tmpdir_str)
        summary_path = tmpdir / "analysis_summary.json"
        metadata_path = tmpdir / "metadata.json"
        write_json(summary_path, summary)
        write_json(metadata_path, metadata)

        all_columns_path = None
        if all_columns is not None:
            all_columns_path = tmpdir / "input_all_columns.npy"
            np.save(all_columns_path, np.asarray(all_columns, dtype=np.float64), allow_pickle=False)

        with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            zf.write(summary_path, "analysis_summary.json")
            zf.write(metadata_path, "metadata.json")
            if all_columns_path is not None:
                zf.write(all_columns_path, "input_all_columns.npy")
            src = Path(source_path) if source_path is not None else None
            if copy_source_txt and src is not None and src.exists() and src.is_file():
                copied = tmpdir / src.name
                shutil.copy2(src, copied)
                zf.write(copied, f"input/{src.name}")

            for field in ("keyPlots", "allPlots"):
                for rel in summary.get(field, []):
                    file_path = root / rel
                    if file_path.exists() and file_path.is_file():
                        zf.write(file_path, rel)
    return (Path("exports") / zip_path.name).as_posix()
