package graphqlconf.app.misc

import androidx.compose.runtime.Composable
import com.apollographql.apollo.api.ApolloResponse
import com.apollographql.apollo.api.Operation

@Composable
fun <D: Operation.Data> ApolloWrapper(
  response: ApolloResponse<D>?,
  onSuccess: @Composable (D) -> Unit,
) {
  when {
    response == null -> {
      Loading()
    }

    response.data == null -> {
      GeneralError(response.exception?.message)
    }

    else -> {
      onSuccess(response.data!!)
    }
  }
}

