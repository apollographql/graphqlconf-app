package graphqlconf.app

import apollo.kotlin.JsonElement
import com.apollographql.apollo.ApolloClient
import com.apollographql.apollo.api.Adapter
import com.apollographql.apollo.api.CustomScalarAdapters
import com.apollographql.apollo.api.json.JsonReader
import com.apollographql.apollo.api.json.JsonWriter
import com.apollographql.apollo.cache.normalized.FetchPolicy
import com.apollographql.apollo.cache.normalized.api.MemoryCache
import com.apollographql.apollo.cache.normalized.api.MemoryCacheFactory
import com.apollographql.apollo.cache.normalized.fetchPolicy
import com.apollographql.apollo.cache.normalized.normalizedCache
import com.apollographql.apollo.cache.normalized.sql.SqlNormalizedCacheFactory
import graphqlconf.api.fragment.SpeakerSummary
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.LocalTime

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
  .normalizedCache(MemoryCacheFactory().chain(SqlNormalizedCacheFactory()))
  .fetchPolicy(FetchPolicy.NetworkFirst)
  .build()


val SpeakerSummary.positionAndCompany: String
  get() {
    return listOf(position, company).filter { it.isNotEmpty() }.joinToString(", ")
  }

object LocalTimeAdapter2: apollo.kotlin.Adapter<LocalTime> {
  override fun fromJson(element: JsonElement): LocalTime {
    return LocalTime.parse(element as String)
  }

  override fun toJson(value: LocalTime): JsonElement {
    return value.toString()
  }
}

object LocalDateTimeAdapter2: apollo.kotlin.Adapter<LocalDateTime> {

  override fun fromJson(element: JsonElement): LocalDateTime {
    return LocalDateTime.parse(element as String)
  }

  override fun toJson(value: LocalDateTime): JsonElement {
    return value.toString()
  }
}
