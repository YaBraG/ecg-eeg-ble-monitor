"""Android-friendly EEG demo analysis package."""

from .config import EEGAnalysisConfig
from .pipeline import run_analysis, run_analysis_from_array

__all__ = ["EEGAnalysisConfig", "run_analysis", "run_analysis_from_array"]
