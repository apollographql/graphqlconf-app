package graphqlconf.app

import com.russhwolf.settings.ObservableSettings
import com.russhwolf.settings.coroutines.getStringOrNullFlow
import com.russhwolf.settings.set
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json

private lateinit var theSettings: ObservableSettings

fun initializeSettings(settings: ObservableSettings) {
  theSettings = settings
}

private val json = Json {
  ignoreUnknownKeys = true
}

private inline fun <reified T> String?.decodeOrNull(): T? {
  if (this == null) return null

  return try {
    json.decodeFromString<T>(this)
  } catch (_: SerializationException) {
    null
  }
}


private const val KEY_BOOKMARKS = "bookmarks"

fun bookmarks(): Flow<Set<SessionId>> {
  return theSettings.getStringOrNullFlow(KEY_BOOKMARKS).map { it.decodeOrNull<Set<SessionId>>() ?: emptySet() }
}

fun setBookmarks(ids: Set<SessionId>) {
  theSettings.set(KEY_BOOKMARKS, json.encodeToString(ids))
}

@Serializable
@JvmInline
value class SessionId(val id: String)
