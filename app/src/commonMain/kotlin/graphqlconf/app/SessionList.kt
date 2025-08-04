package graphqlconf.app

import androidx.compose.runtime.Composable
import apollo.compose.ApolloClient
import apollo.compose.ApolloClientProvider
import apollo.compose.GraphQL
import apollo.compose.Operation
import apollo.compose.useOperation

@GraphQL(
  // language=graphql
"""
  query GetSessions {
    sessions {
      id
      title
      description
      speakers {
        name
      }
      venue
      event_type
      start
      end
    }
  }
"""
)
class GetSessions {
  interface Data: Operation.Data
}

@Composable
fun SessionList() {
  ApolloClientProvider(
    client = { ApolloClient() },
  ) {
    val sessionsState = useOperation(GetSessions())

//    when(val sessions: Lce<Unit> = sessionsState.value) {
//      is Loading -> {
//        Box(modifier = Modifier.fillMaxSize()) {
//          CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
//        }
//      }
//       is Error -> {
//        Box(modifier = Modifier.fillMaxSize()) {
//          Text(
//            text = stringResource(Res.string.oh_no) + sessions.exception.message,
//            style = GraphqlConfTheme.typography.h1,
//            color = GraphqlConfTheme.colors.primaryText,
//            modifier = Modifier.align(Alignment.Center)
//          )
//        }
//      }
//      is Data -> {
//        val listState = rememberLazyListState()
//
//        LazyColumn(modifier = Modifier.fillMaxSize(), state = listState) {
//          this.items(sessions.data!!.sessions) {
//            Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
//              SessionCard(
//                title = getSessionTitle(it.title),
//                eventType = it.event_type,
//                speakers = it.speakers.map { it.name },
//                venue = it.venue,
//                time = DateTimeFormatting.timeToTime(it.start, it.end),
//                onClick = {},
//              )
//            }
//          }
//        }
//      }
//    }
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