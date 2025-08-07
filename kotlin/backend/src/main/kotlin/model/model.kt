package model

import dateFormat
import kotlinx.datetime.LocalTime
import kotlinx.datetime.atTime
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream
import kotlin.collections.filter

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

@ExperimentalSerializationApi
val allSessions: List<JsonSession> by lazy {
  JsonSession::class.java.classLoader.getResourceAsStream("schedule-2025.json")!!.use {
    json.decodeFromStream<List<JsonSession>>(it)
  }.filter { it.venue != "Workspace - 2nd Floor" } // Filter out sessions in the workspace as they seem to be very long
    .map {
      var session = it
      if (it.name == "Registration + Badge Pick-up") {
        // Set the end time to 9:00am to match the schedule even if technically people can still pick up their badges after that
        session = it.copy(event_end = dateFormat.parse(it.event_end).date.atTime(LocalTime(9, 0)).let { dateFormat.format(it) })
      }

      session = session.copy(getSessionTitle(it.name))
      session
    }
}

/**
 * See https://github.com/graphql/graphql.github.io/blob/a3d6819fbedd23b985fc05a37b8fb7722d3a517b/src/app/conf/2025/utils.ts#L49
 */
fun getSessionTitle(title: String): String {
  var t = title
  for (prefix in setOf("Keynote: ", "Unconference: ")) {
    t = t.removePrefix(prefix)
  }
  return t.substringBefore(" -")
}

@ExperimentalSerializationApi
val allSpeakers: List<JsonSpeaker> by lazy {
  JsonSession::class.java.classLoader.getResourceAsStream("speakers.json")!!.use {
    json.decodeFromStream<JsonSpeakers>(it).speakers
  }
}