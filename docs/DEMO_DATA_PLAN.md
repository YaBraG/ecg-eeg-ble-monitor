# Demo Data Plan

The Android demo uses this TXT sample file:

```text
sz1_cleaned (5minB 2minA).txt
```

The app imports TXT, not ZIP. The sample file should not be committed to GitHub because it is large raw EEG demo data. Local sample data paths are ignored in `.gitignore`.

## Expected TXT Shape

- Whitespace-delimited numeric data
- No header row
- Approximately 200,963 rows
- 32 source columns
- Approximately 401.926 seconds at 500 Hz

The current app does lightweight validation only. It checks file name, extension, size if available, and the centralized assumptions. It does not parse the full TXT in JavaScript.

## Analysis Columns

The app preserves and reports all 32 source columns as metadata.

The first 20 columns are assumed to be EEG input columns for future analysis, matching the current MATLAB converter assumption. Columns 21-32 are preserved and reported but not analyzed yet.

## Current Channel Order

```text
C3, C4, CZ, F3, F4, F7, F8, FZ, FP1, FP2, FPZ, O1, O2, P3, P4, PZ, T3, T4, T5, T6
```

A1/A2 are currently assumed to be reference electrodes, not data channels. FPZ is currently assumed to be an actual EEG data channel.

These assumptions are temporary and centralized in `src/config/demoConfig.ts`.

## Future Python Use

Python analysis will later consume either this imported TXT file directly or a converted recording package. The intended future package shape is:

```text
recording_package/
metadata.json
source_txt_file.txt
analysis_summary.json
plots/key/
plots/all/
```
