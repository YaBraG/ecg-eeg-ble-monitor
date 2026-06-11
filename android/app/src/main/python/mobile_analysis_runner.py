import json
import os
import traceback

from eeg_analysis.pipeline import run_analysis


def _clean_path(path):
    """Converts a file URI into a normal Android file path."""
    if path.startswith("file://"):
        return path.replace("file://", "", 1)
    return path


def _safe_exists(path):
    return bool(path) and os.path.exists(path)


def run_mobile_analysis(input_txt_path, output_dir):
    """
    Runs the EEG analysis package from Android.

    Args:
        input_txt_path: Full path to the imported EEG TXT file.
        output_dir: Folder where analysis outputs should be written.

    Returns:
        JSON string with success status and output paths.
    """
    input_txt_path = _clean_path(str(input_txt_path))
    output_dir = _clean_path(str(output_dir))

    summary_path = os.path.join(output_dir, "analysis_summary.json")
    export_zip_path = os.path.join(output_dir, "exports", "debug_export_package.zip")

    try:
        if not os.path.exists(input_txt_path):
            raise FileNotFoundError(f"Input TXT file not found: {input_txt_path}")

        os.makedirs(output_dir, exist_ok=True)

        summary = run_analysis(input_txt_path, output_dir)

        result = {
            "success": True,
            "inputTxtPath": input_txt_path,
            "outputDir": output_dir,
            "summaryPath": summary_path,
            "summaryExists": _safe_exists(summary_path),
            "exportZipPath": export_zip_path,
            "exportZipExists": _safe_exists(export_zip_path),
            "summary": summary if isinstance(summary, dict) else None,
            "error": None,
        }

        return json.dumps(result)

    except Exception as error:
        result = {
            "success": False,
            "inputTxtPath": input_txt_path,
            "outputDir": output_dir,
            "summaryPath": summary_path,
            "summaryExists": _safe_exists(summary_path),
            "exportZipPath": export_zip_path,
            "exportZipExists": _safe_exists(export_zip_path),
            "summary": None,
            "error": str(error),
            "traceback": traceback.format_exc(),
        }

        return json.dumps(result)