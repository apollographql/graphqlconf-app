package graphqlconf.app.screen

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.apollographql.apollo.api.ApolloResponse
import com.apollographql.cache.normalized.FetchPolicy
import com.apollographql.cache.normalized.fetchPolicy
import com.apollographql.cache.normalized.isFromCache
import graphqlconf.api.GetScheduleItemsQuery
import graphqlconf.app.apolloClient
import graphqlconf.app.bookmarks
import graphqlconf.app.misc.ApolloWrapper
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.app.misc.Schedule
import graphqlconf.app.misc.filterScheduleItems
import graphqlconf.design.component.NowButton
import graphqlconf.design.component.NowButtonState
import graphqlconf.design.component.TopMenuButton
import graphqlconf_app.shared.generated.resources.Res
import graphqlconf_app.shared.generated.resources.bookmark
import graphqlconf_app.shared.generated.resources.bookmark_filled
import graphqlconf_app.shared.generated.resources.nav_destination_schedule
import graphqlconf_app.shared.generated.resources.search
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.launch
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toInstant
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.compose.resources.stringResource
import kotlin.time.Clock
import kotlin.time.ExperimentalTime
import kotlin.time.Instant

var firstLaunch: Boolean = true

@Suppress("UnrememberedMutableState")
@Composable
fun ScheduleScreen(
  filterBookmarked: Boolean,
  onSession: (String) -> Unit,
  onFilterBookmarks: (Boolean) -> Unit,
  onSearch: () -> Unit,
) {
  var headerState by rememberSaveable { mutableStateOf(MainHeaderContainerState.Title) }

  Column {
    val listState = rememberLazyListState()
    val responseState = remember {
      val fetchPolicy = if (firstLaunch) {
        firstLaunch = false
        FetchPolicy.NetworkFirst
      } else {
        FetchPolicy.CacheFirst
      }
      apolloClient.query(GetScheduleItemsQuery())
        .fetchPolicy(fetchPolicy)
        .toFlow()
        .removeNetworkErrors()
    }.collectAsStateWithLifecycle(null)
    val bookmarkState = remember {
      bookmarks()
    }.collectAsStateWithLifecycle(emptySet())

    val bookmarks = bookmarkState.value

    val response = responseState.value
    val filteredItems = response?.data?.scheduleItems?.let {
      filterScheduleItems(it, filterBookmarked, bookmarks)
    }
    val nowButtonState = derivedStateOf { computeNowButtonState(filteredItems, listState) }.value
    Header(
      state = headerState,
      titleContent = {

        val scope = rememberCoroutineScope()

        MainHeaderTitleBar(
          title = stringResource(Res.string.nav_destination_schedule), startContent = {
            if (nowButtonState != null) {
              NowButton(
                state = nowButtonState,
                onClick = { scrollIndex ->
                  scope.launch {
                    listState.animateScrollToItem(scrollIndex)
                  }
                }
              )
            }
          },
          endContent = {
            TopMenuButton(
              icon = Res.drawable.search,
              onClick = onSearch,
            )
            TopMenuButton(
              icon = if (filterBookmarked) Res.drawable.bookmark_filled else Res.drawable.bookmark,
              selected = filterBookmarked,
              onToggle = onFilterBookmarks,
            )
          }
        )
      },
    )

    ApolloWrapper(response) {
      Schedule(
        listState = listState,
        scheduleItems = filteredItems!!,
        bookmarks = bookmarks,
        onSession = onSession,
        filterBookmarked = filterBookmarked
      )
    }
  }
}

private fun Flow<ApolloResponse<GetScheduleItemsQuery.Data>>.removeNetworkErrors(): Flow<ApolloResponse<GetScheduleItemsQuery.Data>> {
  return this.filter {
    !(!it.isFromCache && it.data == null)
  }
}

@OptIn(ExperimentalTime::class)
private fun computeNowButtonState(
  items: List<GetScheduleItemsQuery.ScheduleItem>?,
  listState: LazyListState
): NowButtonState? {
  if (items == null) {
    // still loading or error fetching data
    return null
  }

  if (items.isEmpty()) {
    // empty list: no bookmarks, ...
    return null
  }

  val firstVisibleItemIndex = listState.firstVisibleItemIndex
  if (firstVisibleItemIndex == -1) {
    // No list visible
    return null
  }

  val nowInstant = now()
  val now = nowInstant.toLocalDateTime(timeZone)

  val conferenceStart = items.first().start
  val conferenceEnd = items.last().end
  return when {
    now < conferenceStart -> {
      // The conference has not started yet, scroll to the beginning
      NowButtonState.Disabled(0, (conferenceStart.toInstant(timeZone) - nowInstant).inWholeDays.toInt())
    }

    now > conferenceEnd -> {
      // The conference has not started yet, scroll to the beginning
      NowButtonState.ScrollUp(0, true)
    }

    else -> {
      // Lookup the first item to display. This is the  index whose start
      var index = 1
      var scrollIndex = 0
      var scrollStart = items.first().start

      while (index <= items.lastIndex) {
        val itemStart = items.get(index).start

        if (itemStart > now){
          break
        }

        if (itemStart > scrollStart) {
          scrollIndex = index
          scrollStart = itemStart
        }

        index++
      }

      val firstVisible = items.get(firstVisibleItemIndex)

      if (firstVisible.start == scrollStart){
        // Note the scrollIndex isn't used here because the button is disabled
        NowButtonState.Disabled(firstVisibleItemIndex)
      } else if (scrollIndex < firstVisibleItemIndex) {
        NowButtonState.ScrollUp(scrollIndex)
      } else {
        NowButtonState.ScrollDown(scrollIndex)
      }
    }
  }
}

fun now(): Instant {
  return Clock.System.now()
//  return kotlinx.datetime.LocalDateTime(2026, 5, 19, 11, 0).toInstant(timeZone)
}

val timeZone = TimeZone.of("US/Pacific")
