package graphqlconf.app.screen

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.unit.dp
import graphqlconf.app.SessionList
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.design.component.NowButton
import graphqlconf.design.component.NowButtonState
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.nav_destination_schedule
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.stringResource

@Composable
fun ScheduleScreen() {
  var headerState by rememberSaveable { mutableStateOf(MainHeaderContainerState.Title) }

  Column {
    val listState = rememberLazyListState()

    Header(
      state = headerState,
      titleContent = {
        MainHeaderTitleBar(
          title = stringResource(Res.string.nav_destination_schedule),
          startContent = { NowButtonContent(listState) },
          endContent = {
//          TopMenuButton(
//            icon = Res.drawable.bookmark_24,
//            selected = bookmarkFilterEnabled,
//            onToggle = { onBookmarkFilter(it) },
//            contentDescription = stringResource(Res.string.schedule_action_filter_bookmarked),
//          )
//          TopMenuButton(
//            icon = Res.drawable.search_24,
//            onClick = { onHeaderStateChange(MainHeaderContainerState.Search) },
//            contentDescription = stringResource(Res.string.schedule_action_search),
//          )
          }
        )
      },
      searchContent = {
//      @OptIn(ExperimentalComposeUiApi::class)
//      BackHandler(true) {
//        onHeaderStateChange(MainHeaderContainerState.Title)
//        onSearchQueryChange("")
//      }
//      val filterItems by viewModel.filterItems.collectAsState()
//
//      MainHeaderSearchBar(
//        searchValue = searchQuery,
//        // clearing the input should also reset tags
//        onSearchValueChange = { onSearchQueryChange(it) },
//        onClose = {
//          onHeaderStateChange(MainHeaderContainerState.Title)
//          onSearchQueryChange("")
//          onClearSearch()
//        },
//        onClear = onClearSearch,
//        hasAdditionalInputs = filterItems.any { it.isSelected },
//      )
      }
    )
    HorizontalDivider(
      thickness = 1.dp,
      color = GraphqlConfTheme.colors.strokeHalf,
    )

    SessionList(listState)
  }
}


@Composable
private fun NowButtonContent(listState: LazyListState) {

  val scope = rememberCoroutineScope()
  var nowScrolling by remember { mutableStateOf(false) }
  val nowButtonState = NowButtonState.Before

  if (nowButtonState != null) {
    NowButton(
      time = nowButtonState,
      onClick = {
        scope.launch {
          nowScrolling = true
          try {
//            listState.animateScrollToItem(state.firstActiveIndex)
          } finally {
            nowScrolling = false
          }
        }
      }
    )
  }
}

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
