package model

import dateFormat
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.datetime.LocalTime
import kotlinx.datetime.atTime
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.InputStream
import kotlin.math.pow
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds

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
  val speakers: List<JsonSpeaker> = emptyList()
) {
  @Serializable
  class JsonSpeaker(
    val username: String,
    val id: String,
  )
}

@Serializable
class JsonSpeakers(
  val speakers: List<JsonSpeaker>
)

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

private class Refesher<D>(
  val initialValue: () -> D,
  val refreshValue: () -> D,
) {
  private var data = initialValue()
  private var lastTime = 0L
  private var job: Job? = null
  private var tryCount = 0
  private val lock = Object()

  fun data(): D {
    synchronized(lock) {
      if (job == null && System.nanoTime() - lastTime > 2.0.pow(tryCount) * 1.minutes.inWholeNanoseconds) {
        job = GlobalScope.launch {
          try {
            tryCount = 0
            synchronized(lock) {
              data = refreshValue()
              job = null
            }
          } catch (e: Exception) {
            tryCount++
            e.printStackTrace()
          } finally {
            lastTime = System.nanoTime()
          }
        }
      }
    }
    return data
  }
}

private val sessionRefresher = Refesher(
  initialValue = { JsonSession::class.java.classLoader.getResourceAsStream("schedule-2025.json")!!.toSessionList() },
  refreshValue = { getUrl("https://raw.githubusercontent.com/graphql/graphql.github.io/refs/heads/source/scripts/sync-sched/schedule-2025.json").toSessionList() },
)

private val client = OkHttpClient()
private fun getUrl(url: String): InputStream {
  return client.newCall(Request.Builder().url(url).build()).execute().body.byteStream()
}

private val speakersRefresher = Refesher(
  initialValue = { JsonSession::class.java.classLoader.getResourceAsStream("speakers.json")!!.toSpeakerList() },
  refreshValue = { getUrl("https://raw.githubusercontent.com/graphql/graphql.github.io/refs/heads/source/scripts/sync-sched/speakers.json").toSpeakerList() },
)
val allSessions: List<JsonSession>
  get() {
    return sessionRefresher.data()
  }

private fun InputStream.toSessionList(): List<JsonSession> {
  return use {
    json.decodeFromStream<List<JsonSession>>(it)
  }.sanitize()
}

private fun List<JsonSession>.sanitize(): List<JsonSession> {
  return filter { it.venue != "Workspace - 2nd Floor" } // Filter out sessions in the workspace as they seem to be very long
    .mapNotNull {
      var session = it
      if (it.name == "Registration + Badge Pick-up") {
        // Set the end time to 9:00am to match the schedule even if technically people can still pick up their badges after that
        session = it.copy(
          event_end = dateFormat.parse(it.event_end).date.atTime(LocalTime(9, 0)).let { dateFormat.format(it) })
      }
      if (it.name == "Cloakroom") {
        return@mapNotNull null
      }

      session = session.copy(name = getSessionTitle(it.name))
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

private fun InputStream.toSpeakerList(): List<JsonSpeaker> {
  return use {
    json.decodeFromStream<JsonSpeakers>(it).speakers
  }
}

val allSpeakers: List<JsonSpeaker>
  get() {
    return speakersRefresher.data()
  }