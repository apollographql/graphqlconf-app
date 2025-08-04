package apollo.compose

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.State
import androidx.compose.runtime.compositionLocalOf

interface Operation<D: Operation.Data> {
  interface Data
}

annotation class GraphQL(val document: String)

typealias ApolloJsonElement = Any?
interface Adapter<T: Any> {
  fun fromJson(element: ApolloJsonElement): T
  fun toJson(value: T): ApolloJsonElement
}

@Target(AnnotationTarget.CLASS)
annotation class Scalar(val name: String)

class ApolloClient {
}

sealed interface ApolloResult<D> {
  class Loading<D>: ApolloResult<D>
  class Error<D>(val exception: Exception): ApolloResult<D>
  class Data<D>(val data: D): ApolloResult<D>
}


@Composable
fun <D: Operation.Data> useOperation(operation: Operation<D>): State<ApolloResult<D>> {
  TODO()
}

internal val LocalClient = compositionLocalOf<ApolloClient> {
  error("ApolloClientProvider must be part of the call hierarchy")
}

@Composable
fun ApolloClientProvider(
  client: () -> ApolloClient,
  content: @Composable () -> Unit,
) {
  CompositionLocalProvider(
    LocalClient provides client(),
  ) {
    content()
  }
}