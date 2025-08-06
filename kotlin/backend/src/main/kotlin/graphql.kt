@file:OptIn(ExperimentalSerializationApi::class)

import com.apollographql.apollo.ast.GQLStringValue
import com.apollographql.apollo.ast.GQLValue
import com.apollographql.apollo.execution.Coercing
import com.apollographql.apollo.execution.ExternalValue
import com.apollographql.execution.annotation.GraphQLName
import com.apollographql.execution.annotation.GraphQLQuery
import com.apollographql.execution.annotation.GraphQLScalar
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.format.Padding
import kotlinx.datetime.format.char
import kotlinx.serialization.ExperimentalSerializationApi
import model.JsonSession
import model.JsonSpeaker
import model.allSessions
import model.allSpeakers

@GraphQLScalar(LocalDateTimeCoercing::class)
@GraphQLName("LocalDateTime")
typealias GraphQLLocalDateTime = LocalDateTime

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

@GraphQLQuery
class Query {
  fun sessions(): List<Session> {
    return allSessions.map {
      it.toGraphQLSession()
    }
  }

  fun speakers(): List<Speaker> {
    val speakersWithSessions = allSessions.flatMap { it.speakers }.map { it.username }.distinct().toSet()
    return allSpeakers.filter { speakersWithSessions.contains(it.username) }.map {
      it.toGraphQLSpeaker()
    }.sortedBy { it.name }
  }

  val timezone = "Europe/Amsterdam"
}

class Session(
  val title: String,
  val description: String,
  val start: GraphQLLocalDateTime,
  val end: GraphQLLocalDateTime,
  val event_type: String,
  val event_subtype: String,
  val venue: String?,
  val id: String,
  private val speakerUsernames: List<String>
) {
  val speakers: List<Speaker>
    get() {
      return allSpeakers.filter {
        it.username in speakerUsernames
      }.map {
        it.toGraphQLSpeaker()
      }
    }
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
    years = years
  )
}

class Speaker(
  val username: String,
  val company: String,
  val position: String,
  val name: String,
  val about: String,
  val location: String,
  val url: String,
  avatar: String,
  val years: List<Int>,
) {
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
      "http:$this"
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

