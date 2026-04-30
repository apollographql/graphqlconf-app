package model

import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.InputStream
import kotlin.time.Duration

@Serializable
class JsonFile(
  val name: String,
  val path: String
)

@Serializable
data class JsonSession(
  val name: String,
  val event_start: String,
  val event_end: String,
  val event_type: String,
  val event_subtype: String,
  val venue: String? = null,
  val id: String,
  val description: String,
  val speakers: List<JsonSpeaker> = emptyList(),
  val files: List<JsonFile> = emptyList(),
) {
  @Serializable
  class JsonSpeaker(
    val username: String,
    val id: String,
  )
}

@Serializable
class JsonSpeaker(
  val username: String,
  val company: String,
  val position: String,
  val name: String,
  val about: String,
  val location: String,
  val url: String,
  val avatar: String,
  val years: List<Int> = emptyList(),
  val socialurls: List<JsonSocialUrl> = emptyList(),
)

@Serializable
class JsonSocialUrl(
  val service: String,
  val url: String,
)

val json = Json {
  ignoreUnknownKeys = true
}

internal class Refesher<D>(
  val pollingDelay: Duration,
  val initialValue: () -> D,
  val refreshValue: () -> D,
) {
  private var data = initialValue()
  private var lastTime = 0L
  private var job: Job? = null
  private val lock = Any()

  fun data(): D {
    synchronized(lock) {
      if (job == null && System.nanoTime() - lastTime > pollingDelay.inWholeNanoseconds) {
        job = GlobalScope.launch {
          try {
            val newData = refreshValue()
            synchronized(lock) {
              data = newData
              job = null
            }
          } catch (e: Exception) {
            e.printStackTrace()
            synchronized(lock) {
              job = null
            }
          } finally {
            lastTime = System.nanoTime()
          }
        }
      }
    }
    return data
  }
}

internal val client = OkHttpClient()
internal fun getUrl(url: String): InputStream {
  return client.newCall(Request.Builder().url(url).build()).execute().body.byteStream()
}

internal fun InputStream.toSessionList(): List<JsonSession> {
  return use {
    json.decodeFromStream<List<JsonSession>>(it)
  }.sanitize()
}

internal fun List<JsonSession>.sanitize(): List<JsonSession> {
  return map {
    var session = it
    session = session.copy(name = getSessionTitle(it.name))
    if (session.id == "0466574bdb1df2c888e087738a0248f8") {
      session = session.copy(files = session.files + JsonFile(name = "Golden Path", path = "https://goldenpath.benjie.dev/"))
    }
    session
  }
}

/**
 * See https://github.com/graphql/graphql.github.io/blob/a3d6819fbedd23b985fc05a37b8fb7722d3a517b/src/app/conf/2025/utils.ts#L49
 */
private fun getSessionTitle(title: String): String {
  var t = title
  for (prefix in setOf("Keynote: ", "Unconference: ")) {
    t = t.removePrefix(prefix)
  }
  return t.substringBefore(" -")
}

internal fun InputStream.toSpeakerList(): List<JsonSpeaker> {
  return use {
    json.decodeFromStream<List<JsonSpeaker>>(it)
  }
}

