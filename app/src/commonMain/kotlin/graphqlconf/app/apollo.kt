package graphqlconf.app

import apollo.compose.Adapter
import apollo.compose.ApolloJsonElement
import apollo.compose.Scalar
import kotlinx.datetime.LocalDateTime

@Scalar("LocalDateTime")
object LocalDateTimeAdapter: Adapter<LocalDateTime> {
  override fun fromJson(element: ApolloJsonElement): LocalDateTime {
    return LocalDateTime.parse(element as String)
  }

  override fun toJson(value: LocalDateTime): ApolloJsonElement {
    return value.toString()
  }
}