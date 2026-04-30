package model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.decodeFromStream

@Serializable
class SchedSession(
  val id: String,
  val event_key: String? = null,
  val name: String,
  val event_start: String,
  val event_end: String,
  val event_type: String? = null,
  val event_subtype: String? = null,
  val description: String? = null,
  val venue: String? = null,
  val venue_id: String? = null,
  val active: String? = null,
  val pinned: String? = null,
  val seats: String? = null,
  val goers: String? = null,
  val invite_only: String? = null,
  val video_stream: String? = null,
  val speakers: List<SchedSessionSpeaker> = emptyList(),
  val files: List<JsonFile> = emptyList(),
)

@Serializable
class SchedSessionSpeaker(
  val username: String,
  val id: String,
  val name: String,
  val company: String? = null,
)

@Serializable
class SchedSpeaker(
  val id: String,
  val username: String,
  val name: String,
  val email: String? = null,
  val phone: String? = null,
  val about: String? = null,
  val role: String? = null,
  val joined: String? = null,
  val lastactive: String? = null,
  val avatar: String? = null,
  val company: String? = null,
  val position: String? = null,
  val location: String? = null,
)

private const val SCHED_BASE_URL = "https://graphqlconf2026.sched.com"

private fun schedApiKey(): String {
  return requireNotNull(System.getenv("SCHED_API_TOKEN")) {
    "SCHED_API_TOKEN env variable is not set"
  }
}

private val schedSessionsRefresher = Refesher(
  initialValue = { emptyList<SchedSession>() },
  refreshValue = {
    getUrl("$SCHED_BASE_URL/api/session/export?api_key=${schedApiKey()}&format=json").use {
      json.decodeFromStream<List<SchedSession>>(it)
    }
  },
)

private val schedSpeakersRefresher = Refesher(
  initialValue = { emptyList<SchedSpeaker>() },
  refreshValue = {
    val fields = "id,username,name,phone,email,about,role,joined,lastactive,avatar,company,position,location"
    getUrl("$SCHED_BASE_URL/api/user/list?api_key=${schedApiKey()}&format=json&fields=$fields").use {
      json.decodeFromStream<List<SchedSpeaker>>(it)
    }.filter { it.role?.contains("speaker", ignoreCase = true) == true }
  },
)

val allSchedSessions: List<SchedSession>
  get() = schedSessionsRefresher.data()

val allSchedSpeakers: List<SchedSpeaker>
  get() = schedSpeakersRefresher.data()

fun SchedSession.toJsonSession(): JsonSession {
  return JsonSession(
    id = id,
    name = name,
    event_start = event_start,
    event_end = event_end,
    event_type = event_type.orEmpty(),
    event_subtype = event_subtype.orEmpty(),
    venue = venue,
    description = description.orEmpty(),
    speakers = speakers.map { JsonSession.JsonSpeaker(username = it.username, id = it.id) },
    files = files,
  )
}

fun SchedSpeaker.toJsonSpeaker(): JsonSpeaker {
  return JsonSpeaker(
    username = username,
    name = name,
    company = company.orEmpty(),
    position = position.orEmpty(),
    about = about.orEmpty(),
    location = location.orEmpty(),
    avatar = avatar.orEmpty(),
    url = "",
    years = emptyList(),
    socialurls = emptyList(),
  )
}
