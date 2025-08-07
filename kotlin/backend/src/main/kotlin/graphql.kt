@file:OptIn(ExperimentalSerializationApi::class)

import com.apollographql.apollo.ast.GQLStringValue
import com.apollographql.apollo.ast.GQLValue
import com.apollographql.apollo.execution.Coercing
import com.apollographql.apollo.execution.ExternalValue
import com.apollographql.apollo.execution.StringCoercing
import com.apollographql.execution.annotation.GraphQLName
import com.apollographql.execution.annotation.GraphQLQuery
import com.apollographql.execution.annotation.GraphQLScalar
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.LocalTime
import kotlinx.datetime.format.Padding
import kotlinx.datetime.format.char
import kotlinx.serialization.ExperimentalSerializationApi
import model.JsonSession
import model.JsonSocialUrl
import model.JsonSpeaker
import model.allSessions
import model.allSpeakers

@GraphQLScalar(StringCoercing::class)
typealias ID = String

@GraphQLScalar(LocalDateTimeCoercing::class)
@GraphQLName("LocalDateTime")
typealias GraphQLLocalDateTime = LocalDateTime

@GraphQLScalar(LocalDateCoercing::class)
@GraphQLName("LocalDate")
typealias GraphQLLocalDate = LocalDate

@GraphQLScalar(LocalTimeCoercing::class)
@GraphQLName("LocalTime")
typealias GraphQLLocalTime = LocalTime

internal val dateFormat = LocalDateTime.Format {
  year()
  char('-')
  monthNumber(padding = Padding.ZERO)
  char('-')
  day()
  char(' ')
  hour(padding = Padding.ZERO)
  char(':')
  minute(padding = Padding.ZERO)
}

object LocalDateTimeCoercing : Coercing<LocalDateTime> {
  override fun serialize(internalValue: LocalDateTime): ExternalValue {
    return internalValue.toString()
  }

  override fun deserialize(value: ExternalValue): LocalDateTime {
    return LocalDateTime.parse((value as String))
  }

  override fun parseLiteral(value: GQLValue): LocalDateTime {
    return LocalDateTime.parse((value as GQLStringValue).value)
  }
}

object LocalDateCoercing : Coercing<LocalDate> {
  override fun serialize(internalValue: LocalDate): ExternalValue {
    return internalValue.toString()
  }

  override fun deserialize(value: ExternalValue): LocalDate {
    return LocalDate.parse((value as String))
  }

  override fun parseLiteral(value: GQLValue): LocalDate {
    return LocalDate.parse((value as GQLStringValue).value)
  }
}

object LocalTimeCoercing : Coercing<LocalTime> {
  override fun serialize(internalValue: LocalTime): ExternalValue {
    return internalValue.toString()
  }

  override fun deserialize(value: ExternalValue): LocalTime {
    return LocalTime.parse((value as String))
  }

  override fun parseLiteral(value: GQLValue): LocalTime {
    return LocalTime.parse((value as GQLStringValue).value)
  }
}

class Room(
  val name: String,
  val rank: Int,
  val floor: Int,
)

@GraphQLQuery
class Query {
  fun sessions(): List<Session> {
    return allSessions.map {
      it.toGraphQLSession()
    }
  }

  /**
   * null if the session doesn't exist.
   */
  fun session(id: ID): Session? {
    return allSessions.find { it.id == id }?.toGraphQLSession()
  }

  /**
   * Returns a list of ScheduleItems to be displayed in the UI.
   *
   * ScheduleItems introduce day headers as well as time headers.
   * They also make sure the sessions are sorted by start time/room and group them by time slot.
   *
   * A time slot is a manually configured time range. It usually corresponds to a 30-minute slot where 3 sessions can happen in parallel.
   * Because some sessions are shorter, several of them may fit into a single time slot.
   *
   * ScheduleItems also filter out some
   */
  fun scheduleItems(): List<ScheduleItem> {
    return buildItems(sessions())
  }

  fun speakers(): List<Speaker> {
    val speakersWithSessions = allSessions.flatMap { it.speakers }.map { it.username }.distinct().toSet()
    return allSpeakers.filter { speakersWithSessions.contains(it.username) }.map {
      it.toGraphQLSpeaker()
    }.sortedBy { it.name }
  }

  /**
   * null if the speaker doesn't exist.
   */
  fun speaker(id: ID): Speaker? {
    return allSpeakers.find { it.username == id }?.toGraphQLSpeaker()
  }

  val timezone = "Europe/Amsterdam"
}

class Session(
  val title: String,
  val description: String,
  override val start: GraphQLLocalDateTime,
  override val end: GraphQLLocalDateTime,
  val event_type: String,
  val event_subtype: String,
  @Deprecated("Use room instead")
  val venue: String?,
  val id: ID,
  private val speakerUsernames: List<String>
) : ScheduleItem {
  val speakers: List<Speaker>
    get() {
      return allSpeakers.filter {
        it.username in speakerUsernames
      }.map {
        it.toGraphQLSpeaker()
      }
    }

  @Suppress("DEPRECATION")
  val room: Room? = venue?.toRoom()
}

private fun JsonSpeaker.toGraphQLSpeaker(): Speaker {
  return Speaker(
    username = username,
    company = company,
    position = position,
    name = name,
    about = about,
    location = location,
    url = url,
    avatar = avatar,
    years = years,
    socialUrls = socialurls.map { it.toGraphQLSocialUrls() },
  )
}

fun JsonSocialUrl.toGraphQLSocialUrls(): SocialUrl {
  return SocialUrl(
    service = service.toGraphQLSocialService(),
    url = url,
  )
}

enum class SocialService {
  Instagram, Twitter, LinkedIn, Facebook, Other
}

private fun String.toGraphQLSocialService(): SocialService {
  return when (this) {
    "Twitter" ->SocialService.Twitter
      "LinkedIn" -> SocialService.LinkedIn
      "Instagram" -> SocialService.Instagram
      "Facebook" -> SocialService.Facebook
    else -> SocialService.Other
  }
}

class SocialUrl(
  val service: SocialService,
  val url: String
)

@Suppress("DEPRECATION")
class Speaker(
  @Deprecated("Use id instead")
  val username: String,
  val company: String,
  val position: String,
  val name: String,
  val about: String,
  val location: String,
  val url: String,
  avatar: String,
  val years: List<Int>,
  val socialUrls: List<SocialUrl>,
) {
  val id: ID = username
  val avatar = avatar.fixIfNeeded()

  fun sessions(): List<Session> {
    return allSessions.filter {
      it.speakers.any { it.username == username }
    }.map {
      it.toGraphQLSession()
    }
  }

  private fun String.fixIfNeeded(): String {
    return if (startsWith("//")) {
      "https:$this"
    } else {
      this
    }
  }
}

private fun JsonSession.toGraphQLSession(): Session {
  return Session(
    id = id,
    title = name,
    description = description,
    start = dateFormat.parse(event_start),
    end = dateFormat.parse(event_end),
    event_type = event_type,
    event_subtype = event_subtype,
    venue = venue,
    speakerUsernames = speakers.map { it.username },
  )
}

sealed interface ScheduleItem {
  val start: GraphQLLocalDateTime
  val end: GraphQLLocalDateTime
}
class DayHeader(override val start: GraphQLLocalDateTime, override val end: GraphQLLocalDateTime, val title: String) : ScheduleItem
class TimeHeader(override val start: GraphQLLocalDateTime, override val end: GraphQLLocalDateTime, ) : ScheduleItem

private fun String.toRoom(): Room? {
  return when (this) {
    "Grote Zaal - 2nd Floor" -> Room(
      name = "Grote Zaal",
      rank = 0,
      floor = 2
    )

    "IJzaal - 5th Floor" -> Room(
      name = "IJzaal",
      rank = 1,
      floor = 5
    )

    "Studio - 5th Floor" -> Room(
      name = "Studio",
      rank = 2,
      floor = 5
    )

    "BG Foyer - Ground Floor" -> Room(
      name = "BG foyer",
      rank = 3,
      floor = 0
    )

    "Foyer Grote Zaal - 2nd Floor" -> Room(
      name = "Foyer Grote Zaal",
      rank = 4,
      floor = 2
    )

    "Workspace - 2nd Floor" -> Room(
      name = "Workspace",
      rank = 5,
      floor = 2
    )

    else -> null
  }
}

fun buildItems(sessions: List<Session>): List<ScheduleItem> {
  val items = mutableListOf<ScheduleItem>()

  var lastDate: LocalDate? = null
  var dayIndex = 1
  /**
   * List of time slots created by the notebook and then tweaked manually.
   */
  listOf(
    "2025-09-08 08:00" to "2025-09-08 09:00", // edited (registration)
    "2025-09-08 09:00" to "2025-09-08 10:20", // edited (keynotes)
    "2025-09-08 10:20" to "2025-09-08 10:45", // edited (removed solutions showcase)
    "2025-09-08 10:45" to "2025-09-08 11:15",
    "2025-09-08 11:25" to "2025-09-08 11:55",
    "2025-09-08 12:05" to "2025-09-08 12:35",
    "2025-09-08 12:35" to "2025-09-08 13:45",
    "2025-09-08 13:45" to "2025-09-08 14:15",
    "2025-09-08 14:25" to "2025-09-08 14:55",
    "2025-09-08 15:05" to "2025-09-08 15:35",
    "2025-09-08 15:55" to "2025-09-08 16:25",
    "2025-09-08 16:35" to "2025-09-08 17:05",
    "2025-09-08 17:15" to "2025-09-08 17:45",
    "2025-09-08 17:45" to "2025-09-08 18:45",
    "2025-09-09 08:00" to "2025-09-09 09:00", // edited (registration)
    "2025-09-09 09:00" to "2025-09-09 10:30",
    "2025-09-09 10:45" to "2025-09-09 11:25",
    "2025-09-09 11:35" to "2025-09-09 12:15",
    "2025-09-09 12:15" to "2025-09-09 14:15",
    "2025-09-09 14:15" to "2025-09-09 14:55",
    "2025-09-09 15:05" to "2025-09-09 15:45",
    "2025-09-09 16:00" to "2025-09-09 16:40",
    "2025-09-09 16:50" to "2025-09-09 17:30",
    "2025-09-10 08:00" to "2025-09-10 09:00", // edited (registration)
    "2025-09-10 09:00" to "2025-09-10 09:30",
    "2025-09-10 09:40" to "2025-09-10 10:10",
    "2025-09-10 10:20" to "2025-09-10 10:50",
    "2025-09-10 11:15" to "2025-09-10 11:45",
    "2025-09-10 11:55" to "2025-09-10 12:25",
    "2025-09-10 12:25" to "2025-09-10 13:40",
    "2025-09-10 13:40" to "2025-09-10 14:10",
    "2025-09-10 14:20" to "2025-09-10 14:50",
    "2025-09-10 15:00" to "2025-09-10 15:30",
    "2025-09-10 15:50" to "2025-09-10 16:20",
  ).forEach {
    val start = dateFormat.parse(it.first)
    val end = dateFormat.parse(it.second)
    val date = start.date
    if (lastDate == null || lastDate != date) {
      items.add(DayHeader(start, end, "Day $dayIndex"))
      lastDate = date
      dayIndex++
    }
    items.add(TimeHeader(start, end))
    items.addAll(
      // could be optimized but 🤷‍♂️
      sessions.filter {
        it.start in start..<end
      }.sortedBy {
        it.start.toString() + (it.room?.rank ?: Int.MAX_VALUE).toString()
      }
    )
  }

  return items
}
