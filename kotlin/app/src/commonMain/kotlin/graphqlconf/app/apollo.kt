package graphqlconf.app

import com.apollographql.apollo.ApolloClient
import com.apollographql.apollo.api.Adapter
import com.apollographql.apollo.api.CustomScalarAdapters
import com.apollographql.apollo.api.json.JsonReader
import com.apollographql.apollo.api.json.JsonWriter
import kotlinx.datetime.LocalDateTime
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

internal val apolloClient = ApolloClient.Builder()
  .serverUrl("https://main-546835115153.europe-west4.run.app/graphql")
  .build()
