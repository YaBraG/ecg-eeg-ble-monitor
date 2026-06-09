# Android Python Smoke Test

## Purpose

This local Android smoke test checks whether Chaquopy can run Python 3.12 inside the app, import NumPy, SciPy, and Matplotlib, and save a Matplotlib PNG into the app files directory.

This is a feasibility test only. It is not the EEG analysis integration and does not include EEG processing logic.

## Packages Tested

- Python 3.12 through Chaquopy
- NumPy
- SciPy
- Matplotlib with the `Agg` backend

## Files Changed

Local-only native Android files:

- `android/build.gradle`
- `android/app/build.gradle`
- `android/app/src/main/java/com/yabrag/ecgeeegblemonitor/MainActivity.kt`
- `android/app/src/main/python/chaquopy_smoke_test.py`

Tracked documentation files:

- `docs/ANDROID_PYTHON_SMOKE_TEST.md`
- `README.md`
- `CHANGELOG.md`

The `android/` directory is ignored by Git in this repository, so the native Chaquopy edits are local-only unless the ignore policy changes.

## Build Command

```bash
npm run devbuild:android
```

## Watch Logs

```bash
adb logcat -s PythonSmokeTest
```

The smoke test logs a JSON result with:

- `success`
- `numpyVersion`
- `scipyVersion`
- `matplotlibVersion`
- `outputPath`
- `error`

## Check The Generated PNG

```bash
adb shell run-as com.yabrag.ecgeeegblemonitor ls files
```

Expected file:

```text
chaquopy_matplotlib_test.png
```

## Pull The Generated PNG

```bash
adb exec-out run-as com.yabrag.ecgeeegblemonitor cat files/chaquopy_matplotlib_test.png > chaquopy_matplotlib_test.png
```

Do not commit the pulled PNG.

## Notes

- The smoke test runs once when `MainActivity` opens.
- Python is started on a background thread.
- The result is logged with the `PythonSmokeTest` Logcat tag.
- The app shows either `Python smoke test passed` or `Python smoke test failed` as a Toast.
- The APK is restricted to `arm64-v8a` for this phone feasibility test.

## Current Local Result

The first local build attempt with Chaquopy Python 3.12 failed during `:app:installDebugPythonRequirements`.

Gradle installed the Chaquopy plugin and began resolving Python packages for `arm64-v8a`. NumPy resolved from the Chaquopy package index, but SciPy did not:

```text
ERROR: Could not find a version that satisfies the requirement scipy (from versions: none)
ERROR: No matching distribution found for scipy
```

Because the build failed before APK install, the Python smoke test did not run, no Toast was shown, no `PythonSmokeTest` JSON log was produced, and `chaquopy_matplotlib_test.png` was not generated.
