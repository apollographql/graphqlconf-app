package graphqlconf.app.misc

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.apollographql.apollo.api.ApolloResponse
import graphqlconf.api.GetScheduleItemsQuery
import graphqlconf.app.DateTimeFormatting
import graphqlconf.design.component.DayHeader
import graphqlconf.design.component.SessionCard
import graphqlconf.design.theme.GraphqlConfTheme

@Composable
fun Schedule(listState: LazyListState, response: ApolloResponse<GetScheduleItemsQuery.Data>?) {
  when {
    response == null -> {
      Loading()
    }
    response.data == null -> {
      GeneralError(response.exception?.message)
    }
    else -> {
      LazyColumn(modifier = Modifier.fillMaxSize(), state = listState) {
        this.items(response.data!!.scheduleItems) {
          when {
            it.onDayHeader != null -> {
              DayHeader(it.start.date, it.onDayHeader.title)
            }
            it.onTimeHeader != null -> {
              Text(
                modifier = Modifier.padding(horizontal = 16.dp),
                text = DateTimeFormatting.timeToTime(it.start.time, it.end.time),
                color = GraphqlConfTheme.colors.primaryText,
                style = GraphqlConfTheme.typography.h3,
              )
            }
            it.onSession != null -> {
              val session = it.onSession
              Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                SessionCard(
                  title = getSessionTitle(session.title),
                  eventType = session.event_type,
                  speakers = session.speakers.map { it.name },
                  venue = session.room?.name ?: "",
                  time = DateTimeFormatting.timeToTime(it.start.time, it.end.time),
                  onClick = {},
                )
              }
            }
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