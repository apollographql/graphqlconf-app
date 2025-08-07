package graphqlconf.app.misc

import androidx.compose.foundation.gestures.snapping.SnapPosition
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.apollographql.apollo.api.ApolloResponse
import graphqlconf.api.GetScheduleItemsQuery
import graphqlconf.api.type.ScheduleItem
import graphqlconf.app.DateTimeFormatting
import graphqlconf.app.SessionId
import graphqlconf.app.bookmarks
import graphqlconf.app.setBookmarks
import graphqlconf.design.component.DayHeader
import graphqlconf.design.component.SessionCard
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.no_bookmarks
import org.jetbrains.compose.resources.stringResource

@Composable
fun Schedule(
  listState: LazyListState,
  response: ApolloResponse<GetScheduleItemsQuery.Data>?,
  onSession: (String) -> Unit,
  filterBookmarked: Boolean
) {
  val bookmarkState = remember {
    bookmarks()
  }.collectAsStateWithLifecycle(emptySet())

  ApolloWrapper(
    response
  ) {

    val bookmarks = bookmarkState.value
    val scheduleItems = filterScheduleItems(it.scheduleItems, filterBookmarked, bookmarks)

    if (scheduleItems.isEmpty() && filterBookmarked) {
      Box(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        contentAlignment = Alignment.Center,
      ) {
        Text(
          modifier = Modifier.padding(horizontal = 16.dp),
          color = GraphqlConfTheme.colors.text,
          style = GraphqlConfTheme.typography.h2,
          text = stringResource(Res.string.no_bookmarks),
        )
      }
    }

    LazyColumn(modifier = Modifier.fillMaxSize(), state = listState) {
      this.items(scheduleItems) {
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
                bookmarked = SessionId(session.id) in bookmarks,
                onBookmarkChanged = {
                  val newBookmarks = if (it) {
                    bookmarks + SessionId(session.id)
                  } else {
                    bookmarks - SessionId(session.id)
                  }
                  setBookmarks(newBookmarks)
                }
              )
            }
          }
        }
      }
    }
  }
}

private fun filterScheduleItems(scheduleItems: List<GetScheduleItemsQuery.ScheduleItem>, filterBookmarked: Boolean, bookmarks: Set<SessionId>): List<GetScheduleItemsQuery.ScheduleItem> {
  if (!filterBookmarked) return scheduleItems

  var lastDayHeader: GetScheduleItemsQuery.ScheduleItem? = null
  var lastTimeHeader: GetScheduleItemsQuery.ScheduleItem? = null
  var slotHasSession = false
  var dayHasSession = false

  val filtered = mutableListOf<GetScheduleItemsQuery.ScheduleItem>()

  scheduleItems.forEach {
    if (it.onSession != null && SessionId(it.onSession.id) in bookmarks) {
      if (!dayHasSession) {
        if (lastDayHeader != null) {
          filtered.add(lastDayHeader)
        }
        dayHasSession = true
      }
      if (!slotHasSession) {
        if (lastTimeHeader != null) {
          filtered.add(lastTimeHeader)
        }
        slotHasSession = true
      }
      filtered.add(it)
    }
    if (it.onDayHeader != null) {
      lastDayHeader = it
      dayHasSession = false
    }
    if (it.onTimeHeader != null) {
      lastTimeHeader = it
      slotHasSession = false
    }
  }
  return filtered
}
