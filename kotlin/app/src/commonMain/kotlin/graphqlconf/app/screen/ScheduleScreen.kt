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
import com.apollographql.apollo.cache.normalized.FetchPolicy
import com.apollographql.apollo.cache.normalized.fetchPolicy
import com.apollographql.apollo.cache.normalized.isFromCache
import graphqlconf.api.GetScheduleItemsQuery
import graphqlconf.app.apolloClient
import graphqlconf.app.misc.Schedule
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.design.component.NowButton
import graphqlconf.design.component.NowButtonState
import graphqlconf.design.component.TopMenuButton
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.bookmark_filled
import graphqlconf_app.app.generated.resources.nav_destination_schedule
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.launch
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toInstant
import org.jetbrains.compose.resources.stringResource
import kotlin.time.Clock
import kotlin.time.ExperimentalTime
import kotlin.time.Instant

var firstLaunch: Boolean = true

@Suppress("UnrememberedMutableState")
@Composable
fun ScheduleScreen(filterBookmarked: Boolean, onSession: (String) -> Unit, onFilterBookmarks: (Boolean) -> Unit) {
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
    val nowButtonState = derivedStateOf { computeNowButtonState(responseState, listState) }.value
    val response = responseState.value
    Header(
      state = headerState,
      titleContent = {

        val scope = rememberCoroutineScope()

        MainHeaderTitleBar(
          title = stringResource(Res.string.nav_destination_schedule), startContent = {
            if (nowButtonState != null) {
              NowButton(
                state = nowButtonState,
                onClick = {
                  scope.launch {
                    val index = computeNowIndex(responseState)
                    if (index != null) {
                      listState.animateScrollToItem(index)
                    }
                  }
                }
              )
            }
          },
          endContent = {
            TopMenuButton(
              icon = Res.drawable.bookmark_filled,
              selected = filterBookmarked,
              onToggle = onFilterBookmarks,
            )
          }
        )
      },
    )

    Schedule(
      listState = listState,
      response = response,
      onSession = onSession,
      filterBookmarked = filterBookmarked
    )
  }
}

private fun Flow<ApolloResponse<GetScheduleItemsQuery.Data>>.removeNetworkErrors(): Flow<ApolloResponse<GetScheduleItemsQuery.Data>> {
  return this.filter {
    if (!it.isFromCache && it.data == null) {
      false
    } else {
      true
    }
  }
}

@OptIn(ExperimentalTime::class)
private fun computeNowButtonState(
  responseState: State<ApolloResponse<GetScheduleItemsQuery.Data>?>,
  listState: LazyListState
): NowButtonState? {
  val response = responseState.value ?: return null
  if (response.data == null) return null

  val items = response.data!!.scheduleItems

  val firstVisibleItemIndex = listState.firstVisibleItemIndex
  if (firstVisibleItemIndex == -1) {
    // No list visible
    return null
  }

  val now = now()

  val first = items.first()
  if (first.start.toInstant(amsterdamTimeZone) > now) {
    // The conference has not started yet.
    return null
  }
  val last = items.last()
  if (last.end.toInstant(amsterdamTimeZone) < now) {
    // The conference is over.
    return null
  }

  val firstVisible = items.get(firstVisibleItemIndex)

  val visibleStart = firstVisible.start.toInstant(amsterdamTimeZone)
  val visibleEnd = firstVisible.end.toInstant(amsterdamTimeZone)
  return when {
    now < visibleStart -> {
      NowButtonState.After
    }
    now in visibleStart..<visibleEnd -> {
      NowButtonState.Current
    }
    else -> {
      NowButtonState.Before
    }
  }
}

fun now(): Instant {
  return Clock.System.now()
//  return LocalDateTime(2025,9,8,11,0).toInstant(amsterdamTimeZone)
}

private fun computeNowIndex(
  responseState: State<ApolloResponse<GetScheduleItemsQuery.Data>?>,
): Int? {
  val response = responseState.value ?: return null
  if (response.data == null) return null

  val now = now()
  val ret = response.data!!.scheduleItems.indexOfFirst {
    it.onTimeHeader != null && it.start.toInstant(amsterdamTimeZone) >= now
  }

  if (ret == -1) {
    return null
  } else {
    return ret
  }
}

val amsterdamTimeZone = TimeZone.of("Europe/Amsterdam")
