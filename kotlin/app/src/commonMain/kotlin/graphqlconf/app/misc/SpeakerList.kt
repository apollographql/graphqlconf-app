package graphqlconf.app.misc

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import graphqlconf.api.GetSpeakersQuery
import graphqlconf.app.apolloClient
import graphqlconf.design.component.SpeakerCard

@Composable
fun SpeakerList(onSpeaker: (String) -> Unit) {
  val listState = rememberLazyListState()
  val state = remember {
    apolloClient.query(GetSpeakersQuery()).toFlow()
  }.collectAsStateWithLifecycle(null)

  ApolloWrapper(state.value) {
    LazyColumn(modifier = Modifier.fillMaxSize(), state = listState) {
      this.itemsIndexed(it.speakers) { index, it ->
        val it = it.speakerSummary
        Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
          SpeakerCard(
            name = it.name,
            position = it.position,
            company = it.company,
            about = it.about,
            avatar = it.avatar,
            eventTypes = it.sessions.map { it.event_subtype },
            index = index,
            onClick = { onSpeaker(it.id) }
          )
        }
      }
    }
  }

}