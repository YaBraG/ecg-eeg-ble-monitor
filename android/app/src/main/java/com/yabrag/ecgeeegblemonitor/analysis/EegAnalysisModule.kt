package com.yabrag.ecgeeegblemonitor.analysis

import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import org.json.JSONObject

class EegAnalysisModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "EegAnalysis"

  @ReactMethod
  fun runAnalysis(inputTxtUri: String, promise: Promise) {
    Thread {
      try {
        val inputPath = normalizeInputPath(inputTxtUri)
        val outputDir = File(reactContext.applicationContext.filesDir, "eeg_analysis_output")

        if (outputDir.exists() && !outputDir.deleteRecursively()) {
          throw IllegalStateException("Could not clear analysis output folder: ${outputDir.absolutePath}")
        }
        if (!outputDir.mkdirs() && !outputDir.exists()) {
          throw IllegalStateException("Could not create analysis output folder: ${outputDir.absolutePath}")
        }

        if (!Python.isStarted()) {
          Python.start(AndroidPlatform(reactContext.applicationContext))
        }

        val resultJson = Python.getInstance()
          .getModule("mobile_analysis_runner")
          .callAttr("run_mobile_analysis", inputPath, outputDir.absolutePath)
          .toString()
        val result = JSONObject(resultJson)
        val summary = result.optJSONObject("summary")
        val errorValue = result.opt("error")

        val map = Arguments.createMap()
        map.putBoolean("success", result.optBoolean("success", false))
        map.putString("inputTxtPath", result.optString("inputTxtPath", inputPath))
        map.putString("outputDir", result.optString("outputDir", outputDir.absolutePath))
        map.putString("summaryPath", result.optString("summaryPath", ""))
        map.putBoolean("summaryExists", result.optBoolean("summaryExists", false))
        map.putString("exportZipPath", result.optString("exportZipPath", ""))
        map.putBoolean("exportZipExists", result.optBoolean("exportZipExists", false))
        map.putString("error", if (errorValue == null || errorValue == JSONObject.NULL) null else errorValue.toString())
        map.putString("summaryJson", summary?.toString() ?: "")

        promise.resolve(map)
      } catch (error: Throwable) {
        promise.reject(
          "EEG_ANALYSIS_FAILED",
          "Unable to run EEG analysis: ${error.message ?: "unknown error"}",
          error
        )
      }
    }.start()
  }

  private fun normalizeInputPath(inputTxtUri: String): String {
    return if (inputTxtUri.startsWith("file://")) {
      inputTxtUri.removePrefix("file://")
    } else {
      inputTxtUri
    }
  }
}
