package model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.decodeFromStream
import java.net.URLEncoder
import kotlin.time.Duration.Companion.minutes

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
open class SchedSpeakerSmall(
  val id: String? = null,
  val username: String,
  val role: String? = null,
)

@Serializable
class SchedSpeaker(
  val id: String? = null,
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
  val url: String? = null,
  val socialurls: List<JsonSocialUrl> = emptyList(),
)

private const val SCHED_BASE_URL = "https://graphqlconf2026.sched.com"

private const val SCHED_SPEAKER_FIELDS =
  "id,username,name,phone,email,about,role,joined,lastactive,avatar,company,position,location,url,socialurls"

private fun schedApiKey(): String {
  return requireNotNull(System.getenv("SCHED_API_TOKEN")) {
    "SCHED_API_TOKEN env variable is not set"
  }
}

private fun fetchSchedSpeakerDetails(username: String): SchedSpeaker {
  val term = URLEncoder.encode(username, Charsets.UTF_8)
  return getUrl(
    "$SCHED_BASE_URL/api/user/get?api_key=${schedApiKey()}&by=username&term=$term&fields=$SCHED_SPEAKER_FIELDS&format=json"
  ).use {
    json.decodeFromStream<SchedSpeaker>(it)
  }
}

internal val schedSessionsRefresher = Refesher(
  "sessions",
  pollingDelay = 5.minutes,
  initialValue = { JsonSession::class.java.classLoader.getResourceAsStream("sessions.json")!!.toSessionList() },
  refreshValue = {
    getUrl("$SCHED_BASE_URL/api/session/export?api_key=${schedApiKey()}&format=json").use {
      json.decodeFromStream<List<SchedSession>>(it)
    }.map {
      it.toJsonSession()
    }
  },
)

internal val schedSpeakersRefresher = Refesher(
  "speakers",
  pollingDelay = 30.minutes,
  initialValue = { JsonSpeaker::class.java.classLoader.getResourceAsStream("speakers.json")!!.toSpeakerList() },
  refreshValue = {
    val basics = getUrl(
      "$SCHED_BASE_URL/api/user/list?api_key=${schedApiKey()}&format=json&fields=$SCHED_SPEAKER_FIELDS"
    ).use {
      json.decodeFromStream<List<SchedSpeakerSmall>>(it)
    }.filter { it.role?.contains("speaker", ignoreCase = true) == true }

    basics.map { speaker ->
      // /user/list does not return socialurls; /user/get does. Sched rate-limits at 30 req/min.
      Thread.sleep(2_500)
      runCatching { fetchSchedSpeakerDetails(speaker.username) }.getOrThrow()
    }.map {
      it.toJsonSpeaker()
    }
  },
)

val allSessions: List<JsonSession>
  get() = schedSessionsRefresher.data()

val allSpeakers: List<JsonSpeaker>
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
    url = url.orEmpty(),
    years = emptyList(),
    socialurls = socialurls,
  )
}
