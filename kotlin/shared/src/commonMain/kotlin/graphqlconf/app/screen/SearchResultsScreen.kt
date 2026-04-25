package graphqlconf.app.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.LocalPlatformContext
import graphqlconf.api.GetScheduleItemsQuery
import graphqlconf.api.GetSpeakersQuery
import graphqlconf.app.DateTimeFormatting
import graphqlconf.app.SessionId
import graphqlconf.app.apolloClient
import graphqlconf.app.bookmarks
import graphqlconf.app.cancelNotification
import graphqlconf.app.scheduleNotification
import graphqlconf.app.setBookmarks
import graphqlconf.design.component.SessionCard
import graphqlconf.design.component.SpeakerCard
import graphqlconf.design.component.TopMenuButton
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.shared.generated.resources.Res
import graphqlconf_app.shared.generated.resources.arrow_left
import graphqlconf_app.shared.generated.resources.search_placeholder
import graphqlconf_app.shared.generated.resources.search_section_sessions
import graphqlconf_app.shared.generated.resources.search_section_speakers
import kotlinx.datetime.toInstant
import org.jetbrains.compose.resources.stringResource
import kotlin.time.Duration.Companion.minutes

@Composable
fun SearchResultsScreen(
  onBack: () -> Unit,
  onSession: (String) -> Unit,
  onSpeaker: (String) -> Unit,
) {
  var query by rememberSaveable { mutableStateOf("") }
  val focusRequester = remember { FocusRequester() }

  LaunchedEffect(Unit) {
    focusRequester.requestFocus()
  }

  val scheduleState = remember {
    apolloClient.query(GetScheduleItemsQuery()).toFlow()
  }.collectAsStateWithLifecycle(null)
  val speakersState = remember {
    apolloClient.query(GetSpeakersQuery()).toFlow()
  }.collectAsStateWithLifecycle(null)
  val bookmarkState = remember { bookmarks() }.collectAsStateWithLifecycle(emptySet())

  Column(modifier = Modifier.fillMaxSize().background(GraphqlConfTheme.colors.background)) {
    Row(
      modifier = Modifier
        .height(48.dp)
        .fillMaxWidth()
        .background(GraphqlConfTheme.colors.surface),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      TopMenuButton(
        icon = Res.drawable.arrow_left,
        onClick = onBack,
      )
      Box(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
        BasicTextField(
          value = query,
          onValueChange = { query = it },
          singleLine = true,
          modifier = Modifier.fillMaxWidth().focusRequester(focusRequester),
          textStyle = GraphqlConfTheme.typography.bodyMedium.copy(color = GraphqlConfTheme.colors.text),
          cursorBrush = SolidColor(GraphqlConfTheme.colors.text),
          keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
          decorationBox = { innerTextField ->
            if (query.isEmpty()) {
              Text(
                text = stringResource(Res.string.search_placeholder),
                style = GraphqlConfTheme.typography.bodyMedium,
                color = GraphqlConfTheme.colors.textDimmed,
              )
            }
            innerTextField()
          },
        )
      }
    }
    HorizontalDivider(
      thickness = 1.dp,
      color = GraphqlConfTheme.colors.textDimmed,
    )

    val trimmed = query.trim()
    if (trimmed.isEmpty()) return@Column

    val sessions = scheduleState.value?.data?.scheduleItems
      ?.filter { it.onSession?.matches(trimmed) == true }
      .orEmpty()
    val speakers = speakersState.value?.data?.speakers
      ?.filter { it.matches(trimmed) }
      .orEmpty()

    val bookmarks = bookmarkState.value
    val context = LocalPlatformContext.current
    val listState = rememberLazyListState()

    LazyColumn(modifier = Modifier.fillMaxSize(), state = listState) {
      if (sessions.isNotEmpty()) {
        item("sessions-header") { SectionHeader(stringResource(Res.string.search_section_sessions)) }
        itemsIndexed(sessions, key = { _, item -> "session-${item.onSession!!.id}" }) { _, item ->
          val session = item.onSession!!
          Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
            SessionCard(
              title = session.title,
              eventType = session.event_type,
              speakers = session.speakers.map { it.name },
              venue = session.room?.name ?: "",
              time = DateTimeFormatting.timeToTime(item.start.time, item.end.time),
              onClick = { onSession(session.id) },
              bookmarked = SessionId(session.id) in bookmarks,
              onBookmarkChanged = {
                val newBookmarks = if (it) {
                  context.scheduleNotification(
                    sessionId = session.id,
                    scheduleAt = item.start.toInstant(timeZone) - 10.minutes,
                    title = session.title,
                    room = session.room?.name ?: "",
                  )
                  bookmarks + SessionId(session.id)
                } else {
                  context.cancelNotification(session.id)
                  bookmarks - SessionId(session.id)
                }
                setBookmarks(newBookmarks)
              },
            )
          }
        }
      }
      if (speakers.isNotEmpty()) {
        item("speakers-header") { SectionHeader(stringResource(Res.string.search_section_speakers)) }
        itemsIndexed(speakers, key = { _, s -> "speaker-${s.speakerSummary.id}" }) { index, speaker ->
          val s = speaker.speakerSummary
          Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
            SpeakerCard(
              name = s.name,
              position = s.position,
              company = s.company,
              about = s.about,
              avatar = s.avatar,
              eventTypes = s.sessions.map { it.event_subtype },
              index = index,
              onClick = { onSpeaker(s.id) },
            )
          }
        }
      }
    }
  }
}

@Composable
private fun SectionHeader(text: String) {
  Text(
    text = text,
    style = GraphqlConfTheme.typography.h3,
    color = GraphqlConfTheme.colors.text,
    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
  )
}

private fun GetScheduleItemsQuery.OnSession.matches(query: String): Boolean {
  return title.contains(query, ignoreCase = true) ||
    description.contains(query, ignoreCase = true) ||
    speakers.any { it.name.contains(query, ignoreCase = true) }
}

private fun GetSpeakersQuery.Speaker.matches(query: String): Boolean {
  val s = speakerSummary
  return s.name.contains(query, ignoreCase = true) ||
    s.position.contains(query, ignoreCase = true) ||
    s.company.contains(query, ignoreCase = true)
}
