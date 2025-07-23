package model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream

@Serializable
class JsonSession(
  val name: String,
  val event_start: String,
  val event_end: String,
  val event_type: String,
  val venue: String,
  val id: String,
  val description: String,
  val speakers: List<JsonSpeaker> = emptyList()
) {
  @Serializable
  class JsonSpeaker(
    val username: String,
    val id: String
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
)

val json = Json {
  ignoreUnknownKeys = true
}

val allSessions: List<JsonSession> by lazy {
  JsonSession::class.java.classLoader.getResourceAsStream("schedule-2025.json")!!.use {
    json.decodeFromStream<List<JsonSession>>(it)
  }
}

val allSpeakers: List<JsonSpeaker> by lazy {
  JsonSession::class.java.classLoader.getResourceAsStream("speakers.json")!!.use {
    json.decodeFromStream<JsonSpeakers>(it).speakers
  }
}