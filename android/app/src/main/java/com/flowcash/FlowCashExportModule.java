package com.flowcash;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class FlowCashExportModule extends ReactContextBaseJavaModule {
  private static final String DOWNLOAD_FOLDER = "FlowCash";
  private final ReactApplicationContext reactContext;

  FlowCashExportModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @NonNull
  @Override
  public String getName() {
    return "FlowCashExport";
  }

  @ReactMethod
  public void saveExcelFile(String fileName, String content, Promise promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        saveWithMediaStore(fileName, content, promise);
      } else {
        saveWithLegacyStorage(fileName, content, promise);
      }
    } catch (Exception exception) {
      promise.reject("EXPORT_FAILED", exception);
    }
  }

  private void saveWithMediaStore(String fileName, String content, Promise promise)
      throws Exception {
    ContentResolver resolver = reactContext.getContentResolver();
    ContentValues values = new ContentValues();
    values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
    values.put(MediaStore.MediaColumns.MIME_TYPE, "application/vnd.ms-excel");
    values.put(
        MediaStore.MediaColumns.RELATIVE_PATH,
        Environment.DIRECTORY_DOWNLOADS + File.separator + DOWNLOAD_FOLDER);
    values.put(MediaStore.MediaColumns.IS_PENDING, 1);

    Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
    if (uri == null) {
      throw new IllegalStateException("Unable to create export file.");
    }

    try (OutputStream stream = resolver.openOutputStream(uri)) {
      if (stream == null) {
        throw new IllegalStateException("Unable to open export file.");
      }
      stream.write(content.getBytes(StandardCharsets.UTF_8));
    }

    values.clear();
    values.put(MediaStore.MediaColumns.IS_PENDING, 0);
    resolver.update(uri, values, null, null);
    promise.resolve(Environment.DIRECTORY_DOWNLOADS + "/" + DOWNLOAD_FOLDER + "/" + fileName);
  }

  private void saveWithLegacyStorage(String fileName, String content, Promise promise)
      throws Exception {
    File downloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
    File folder = new File(downloads, DOWNLOAD_FOLDER);
    if (!folder.exists() && !folder.mkdirs()) {
      throw new IllegalStateException("Unable to create export folder.");
    }

    File file = new File(folder, fileName);
    try (OutputStream stream = new FileOutputStream(file)) {
      stream.write(content.getBytes(StandardCharsets.UTF_8));
    }
    promise.resolve(file.getAbsolutePath());
  }
}
