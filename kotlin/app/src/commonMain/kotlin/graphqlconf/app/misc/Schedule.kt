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
fun Schedule(
  listState: LazyListState,
  response: ApolloResponse<GetScheduleItemsQuery.Data>?,
  onSession: (String) -> Unit
) {
  ApolloWrapper(
    response
  ) {
    LazyColumn(modifier = Modifier.fillMaxSize(), state = listState) {
      this.items(it.scheduleItems) {
        when {
          it.onDayHeader != null -> {
            DayHeader(it.start.date, it.onDayHeader.title)
          }

          it.onTimeHeader != null -> {
            Text(
              modifier = Modifier.padding(horizontal = 16.dp),
              text = DateTimeFormatting.timeToTime(it.start.time, it.end.time),
              color = GraphqlConfTheme.colors.text,
              style = GraphqlConfTheme.typography.h3,
            )
          }

          it.onSession != null -> {
            val session = it.onSession
            Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
              SessionCard(
                title = session.title,
                eventType = session.event_type,
                speakers = session.speakers.map { it.name },
                venue = session.room?.name ?: "",
                time = DateTimeFormatting.timeToTime(it.start.time, it.end.time),
                onClick = { onSession(session.id) },
              )
            }
          }
        }
      }
    }
  }
}
