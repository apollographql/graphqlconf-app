import com.apollographql.apollo.ast.GQLStringValue
import com.apollographql.apollo.ast.GQLValue
import com.apollographql.apollo.execution.Coercing
import com.apollographql.apollo.execution.ExternalValue
import com.apollographql.execution.annotation.GraphQLQuery
import com.apollographql.execution.annotation.GraphQLScalar
import kotlinx.datetime.LocalDateTime
import model.allSessions
import model.allSpeakers

@GraphQLScalar(LocalDateTimeCoercing::class)
typealias GraphQLLocalDateTime = LocalDateTime

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
      Session(
        id = it.id,
        title = it.name,
        description = it.description,
        start = LocalDateTime.parse(it.event_start),
        end = LocalDateTime.parse(it.event_start),
        event_type = it.event_type,
        venue = it.venue,
        speakerUsernames = it.speakers.orEmpty().map { it.username }
      )
    }
  }

  fun speakers(): List<Speaker> {
    return allSpeakers.map {
      Speaker(
        username = it.username,
        company = it.company,
        position = it.position,
        name = it.name,
        about = it.about,
        location = it.location,
        url = it.url,
        avatar = it.avatar
      )
    }
  }
}

class Session(
  val title: String,
  val description: String,
  val start: GraphQLLocalDateTime,
  val end: GraphQLLocalDateTime,
  val event_type: String,
  val venue: String,
  val id: String,
  private val speakerUsernames: List<String>
) {
  val speakers: List<Speaker>
    get() {
      return allSpeakers.filter {
        it.username in speakerUsernames
      }.map {
        Speaker(
          username = it.username,
          company = it.company,
          position = it.position,
          name = it.name,
          about = it.about,
          location = it.location,
          url = it.url,
          avatar = it.avatar
        )
      }
    }
}

class Speaker(
  val username: String,
  val company: String,
  val position: String,
  val name: String,
  val about: String,
  val location: String,
  val url: String,
  val avatar: String,
)

