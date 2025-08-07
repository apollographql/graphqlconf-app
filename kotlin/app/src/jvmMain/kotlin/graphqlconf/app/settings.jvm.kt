package graphqlconf.app

import com.russhwolf.settings.ExperimentalSettingsApi
import com.russhwolf.settings.ObservableSettings
import com.russhwolf.settings.PropertiesSettings
import com.russhwolf.settings.observable.makeObservable
import java.io.File
import java.nio.charset.StandardCharsets
import java.util.Properties

@OptIn(ExperimentalSettingsApi::class)
actual fun createSettings(): ObservableSettings {
  val propsFile = File("store.properties")

  val props = try {
    propsFile.reader(StandardCharsets.UTF_8).use { reader ->
      Properties().apply { load(reader) }
    }
  } catch (_: Exception) {
    Properties()
  }

  return PropertiesSettings(
    delegate = props,
    onModify = { props ->
      propsFile.writer(StandardCharsets.UTF_8).use { writer ->
        props.store(writer, null)
      }
    }
  ).makeObservable()
}