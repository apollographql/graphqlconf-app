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
import graphqlconf.api.GetScheduleItemsQuery
import graphqlconf.app.apolloClient
import graphqlconf.app.misc.Schedule
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.design.component.NowButton
import graphqlconf.design.component.NowButtonState
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.nav_destination_schedule
import kotlinx.coroutines.launch
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.UtcOffset
import kotlinx.datetime.atDate
import kotlinx.datetime.atStartOfDayIn
import kotlinx.datetime.atTime
import kotlinx.datetime.toInstant
import org.jetbrains.compose.resources.stringResource
import java.time.Instant
import kotlin.time.Clock
import kotlin.time.ExperimentalTime

@Suppress("UnrememberedMutableState")
@Composable
fun ScheduleScreen() {
  var headerState by rememberSaveable { mutableStateOf(MainHeaderContainerState.Title) }

  Column {
    val listState = rememberLazyListState()
    val responseState: State<ApolloResponse<GetScheduleItemsQuery.Data>?> = remember {
      apolloClient.query(GetScheduleItemsQuery()).toFlow()
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
                    listState.animateScrollToItem(state.firstActiveIndex)
                  }
                }
              )
            }
          },
          endContent = {

          }
        )
      },
    )

    Schedule(listState, response)
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
  val first = items.get(listState.firstVisibleItemIndex)
  val last = items.get(listState.lastVisibleItemIndex)

  val now = LocalDateTime(2025, 9, 8, 11, 0).toInstant(UtcOffset.ZERO)//Clock.System.now()

  val listStart = when {
    first.onDayHeader != null -> first.onDayHeader.date.atTime(8, 0).toInstant(TimeZone.of("Europe/Amsterdam"))
    first.onTimeHeader != null -> first.onTimeHeader.slotStart.atDate()
    else -> null

  }

}

private val LazyListState.lastVisibleItemIndex
  get() = layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: -1



//
//private fun computeNowButtonState(
//  state: ScheduleUiState.Content,
//  listState: LazyListState,
//  nowScrolling: Boolean,
//): NowButtonState? {
//  if (nowScrolling) return NowButtonState.Current
//
//  val firstActiveIndex = state.firstActiveIndex
//  val lastActiveIndex = state.lastActiveIndex
//
//  if (firstActiveIndex == -1 || lastActiveIndex == -1) return null
//
//  val firstVisible = listState.firstVisibleItemIndex
//  val lastVisible = listState.lastVisibleItemIndex
//
//  if (firstVisible == -1 || lastVisible == -1) return null
//
//  val lastFullyVisible = lastVisible - 1
//  if (lastFullyVisible < firstActiveIndex) {
//    return NowButtonState.Before
//  }
//
//  val firstMostlyVisible = firstVisible + (if (listState.firstVisibleItemScrollOffset > 50) 1 else 0)
//  if (firstMostlyVisible > lastActiveIndex) {
//    return NowButtonState.After
//  }
//
//  return NowButtonState.Current
//}
//
