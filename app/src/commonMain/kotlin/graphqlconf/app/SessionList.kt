package graphqlconf.app

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.apollographql.apollo.ApolloClient
import com.apollographql.apollo.api.ApolloResponse
import graphqlconf.api.GetSessionsQuery
import graphqlconf.design.component.SessionCard
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.oh_no
import org.jetbrains.compose.resources.stringResource


@Composable
fun SessionList() {
  val responseState: State<ApolloResponse<GetSessionsQuery.Data>?> = remember {
    apolloClient.query(GetSessionsQuery()).toFlow()
  }.collectAsStateWithLifecycle(null)

  val response = responseState.value
  when {
    response == null -> {
      Box(modifier = Modifier.fillMaxSize()) {
        CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
      }
    }
    response.data == null -> {
      Box(modifier = Modifier.fillMaxSize()) {
        Text(
          text = stringResource(Res.string.oh_no) + response.exception?.message,
          style = GraphqlConfTheme.typography.h1,
          color = GraphqlConfTheme.colors.primaryText,
          modifier = Modifier.align(Alignment.Center)
        )
      }
    }
    else -> {
      val listState = rememberLazyListState()

      LazyColumn(modifier = Modifier.fillMaxSize(), state = listState) {
        this.items(response.data!!.sessions) {
          Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
            SessionCard(
              title = getSessionTitle(it.title),
              eventType = it.event_type,
              speakers = it.speakers.map { it.name },
              venue = it.venue,
              time = DateTimeFormatting.timeToTime(it.start, it.end),
              onClick = {},
            )
          }
        }
      }
    }
  }
}

/**
 * See https://github.com/graphql/graphql.github.io/blob/a3d6819fbedd23b985fc05a37b8fb7722d3a517b/src/app/conf/2025/utils.ts#L49
 */
fun getSessionTitle(title: String): String {
  var t = title
  for (prefix in setOf("Keynote: ", "Unconference: ")) {
    t = t.removePrefix(prefix)
  }
  return t.substringBefore(" -")
}