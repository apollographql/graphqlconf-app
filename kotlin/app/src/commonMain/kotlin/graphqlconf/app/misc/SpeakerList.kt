package graphqlconf.app.misc

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import graphqlconf.api.GetSpeakersQuery
import graphqlconf.app.DateTimeFormatting
import graphqlconf.app.apolloClient
import graphqlconf.design.component.SessionCard

@Composable
fun SpeakerList(listState: LazyListState) {
  val state = remember {
    apolloClient.query(GetSpeakersQuery()).toFlow()
  }.collectAsStateWithLifecycle(null)

  val response = state.value
  when  {
    response == null -> {
      Loading()
    }
    response.data == null -> {
      GeneralError(null)
    }
    else -> {
      LazyColumn(modifier = Modifier.fillMaxSize(), state = listState) {
        this.items(response.data!!.speakers) {
          Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
            SpeakerCard(
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