import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.*
import coil3.ImageLoader
import coil3.SingletonImageLoader
import coil3.network.okhttp.OkHttpNetworkFetcherFactory
import coil3.request.crossfade
import graphqlconf.app.App
import graphqlconf.design.catalog.Gallery
import okhttp3.OkHttpClient
import okio.FileSystem
import java.io.File
import java.util.*

private const val WINDOW_CONFIG_FILE = "window.properties"
private const val WINDOW_WIDTH = "window.width"
private const val WINDOW_HEIGHT = "window.height"
private const val WINDOW_X = "window.x"
private const val WINDOW_Y = "window.y"
private const val WINDOW_IS_MAXIMIZED = "window.isMaximized"

private fun debugImageLoading() {
  FileSystem.SYSTEM_TEMPORARY_DIRECTORY.toFile().deleteRecursively()
  SingletonImageLoader.setSafe {
    ImageLoader.Builder(it)
      .crossfade(true)
      .components {
        add(
          OkHttpNetworkFetcherFactory(
            callFactory = {
              OkHttpClient.Builder()
                .addInterceptor {
                  it.proceed(it.request())
                }.build()
            }
          )
        )
      }
      .build()
  }
}

fun main() = application {
  val windowState = rememberWindowState(
    placement = WindowPlacement.Floating,
    position = loadWindowPosition(),
    size = loadWindowSize()
  )

  Window(
    onCloseRequest = {
      saveWindowState(windowState)
      exitApplication()
    },
    state = windowState,
    alwaysOnTop = false,
    title = "My App"
  ) {
    App()
    //Gallery()
  }
}


private fun loadWindowSize(): androidx.compose.ui.unit.DpSize {
  val properties = Properties().apply {
    val file = File(WINDOW_CONFIG_FILE)
    if (file.exists()) {
      file.inputStream().use { load(it) }
    }
  }

  return androidx.compose.ui.unit.DpSize(
    width = properties.getProperty(WINDOW_WIDTH, "800").toFloat().dp,
    height = properties.getProperty(WINDOW_HEIGHT, "600").toFloat().dp
  )
}

private fun loadWindowPosition(): WindowPosition {
  val properties = Properties().apply {
    val file = File(WINDOW_CONFIG_FILE)
    if (file.exists()) {
      file.inputStream().use { load(it) }
    }
  }

  return WindowPosition(
    x = properties.getProperty(WINDOW_X, "0").toDouble().dp,
    y = properties.getProperty(WINDOW_Y, "0").toDouble().dp
  )
}

private fun saveWindowState(windowState: WindowState) {
  val properties = Properties()

  properties.setProperty(WINDOW_WIDTH, windowState.size.width.value.toString())
  properties.setProperty(WINDOW_HEIGHT, windowState.size.height.value.toString())
  properties.setProperty(WINDOW_X, windowState.position.x.value.toString())
  properties.setProperty(WINDOW_Y, windowState.position.y.value.toString())
  properties.setProperty(WINDOW_IS_MAXIMIZED,
    (windowState.placement == WindowPlacement.Maximized).toString())

  File(WINDOW_CONFIG_FILE).outputStream().use {
    properties.store(it, null)
  }
}
