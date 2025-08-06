package graphqlconf.app

import com.apollographql.apollo.ApolloClient
import com.apollographql.apollo.api.Adapter
import com.apollographql.apollo.api.CustomScalarAdapters
import com.apollographql.apollo.api.json.JsonReader
import com.apollographql.apollo.api.json.JsonWriter
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.LocalTime
import kotlinx.datetime.toJavaLocalDateTime

object LocalDateTimeAdapter: Adapter<LocalDateTime> {
  override fun fromJson(
    reader: JsonReader,
    customScalarAdapters: CustomScalarAdapters
  ): LocalDateTime {
    return LocalDateTime.parse(reader.nextString()!!)
  }

  override fun toJson(
    writer: JsonWriter,
    customScalarAdapters: CustomScalarAdapters,
    value: LocalDateTime
  ) {
    writer.value(value.toString())
  }
}

object LocalTimeAdapter: Adapter<LocalTime> {
  override fun fromJson(
    reader: JsonReader,
    customScalarAdapters: CustomScalarAdapters
  ): LocalTime {
    return LocalTime.parse(reader.nextString()!!)
  }

  override fun toJson(
    writer: JsonWriter,
    customScalarAdapters: CustomScalarAdapters,
    value: LocalTime
  ) {
    writer.value(value.toString())
  }
}

object LocalDateAdapter: Adapter<LocalDate> {
  override fun fromJson(
    reader: JsonReader,
    customScalarAdapters: CustomScalarAdapters
  ): LocalDate {
    return LocalDate.parse(reader.nextString()!!)
  }

  override fun toJson(
    writer: JsonWriter,
    customScalarAdapters: CustomScalarAdapters,
    value: LocalDate
  ) {
    writer.value(value.toString())
  }
}

internal val apolloClient = ApolloClient.Builder()
  .serverUrl("https://graphqlconf.app/graphql")
  .build()
