package graphqlconf.app.screen

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import graphqlconf.api.GetSessionQuery
import graphqlconf.api.SubmitFeedbackMutation
import graphqlconf.api.type.FeedbackInput
import graphqlconf.api.type.Rating
import graphqlconf.app.DateTimeFormatting
import graphqlconf.app.apolloClient
import graphqlconf.app.misc.ApolloWrapper
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.app.misc.PaddingRow
import graphqlconf.app.userId
import graphqlconf.design.component.Badges
import graphqlconf.design.component.SpeakerCardContent
import graphqlconf.design.component.TopMenuButton
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.shared.generated.resources.Res
import graphqlconf_app.shared.generated.resources.arrow_left
import graphqlconf_app.shared.generated.resources.calendar_today
import graphqlconf_app.shared.generated.resources.download
import graphqlconf_app.shared.generated.resources.feedback_comment_placeholder
import graphqlconf_app.shared.generated.resources.feedback_rating_disappointed
import graphqlconf_app.shared.generated.resources.feedback_rating_happy
import graphqlconf_app.shared.generated.resources.feedback_rating_neutral
import graphqlconf_app.shared.generated.resources.feedback_submit
import graphqlconf_app.shared.generated.resources.feedback_submitting
import graphqlconf_app.shared.generated.resources.feedback_thanks
import graphqlconf_app.shared.generated.resources.feedback_title
import graphqlconf_app.shared.generated.resources.location
import graphqlconf_app.shared.generated.resources.nav_destination_session
import graphqlconf_app.shared.generated.resources.oh_no
import graphqlconf_app.shared.generated.resources.open_resource
import graphqlconf_app.shared.generated.resources.session_description
import graphqlconf_app.shared.generated.resources.session_resources
import graphqlconf_app.shared.generated.resources.session_speakers
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource

@Composable
fun SessionScreen(id: String, onBack: () -> Unit, onSpeaker: (String) -> Unit) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(GraphqlConfTheme.colors.background)
  ) {
    Header(
      state = MainHeaderContainerState.Title,
      titleContent = {
        MainHeaderTitleBar(
          title = stringResource(Res.string.nav_destination_session),
          startContent = {
            TopMenuButton(
              icon = Res.drawable.arrow_left,
              onClick = onBack,
            )
          }
        )
      },
    )
    val responseState = remember {
      apolloClient.query(GetSessionQuery(id)).toFlow()
    }.collectAsStateWithLifecycle(null)

    ApolloWrapper(responseState.value) {
      val session = it.session
      if (session == null) {
        Box {
          Text(
            text = "Session not found",
            color = GraphqlConfTheme.colors.text,
            style = GraphqlConfTheme.typography.h2,
            modifier = Modifier.align(Alignment.Center)
          )
        }
        return@ApolloWrapper
      }
      Column(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
          PaddingRow(Modifier.height(IntrinsicSize.Min)) {
            Column(modifier = Modifier.weight(1f).padding(horizontal = 8.dp)) {
              Spacer(modifier = Modifier.height(16.dp))
              Text(
                color = GraphqlConfTheme.colors.text,
                style = GraphqlConfTheme.typography.h2,
                text = session.speakers.joinToString(", ") { it.speakerSummary.name },
              )
              Spacer(modifier = Modifier.height(16.dp))
              Text(
                color = GraphqlConfTheme.colors.text,
                style = GraphqlConfTheme.typography.h1,
                text = session.title,
              )
              Spacer(modifier = Modifier.height(16.dp))
              Column {
                Row {
                  Image(
                    painter = painterResource(Res.drawable.calendar_today),
                    contentDescription = "Time",
                    colorFilter = ColorFilter.tint(GraphqlConfTheme.colors.secondary),
                    modifier = Modifier.align(Alignment.CenterVertically),
                  )
                  Spacer(modifier = Modifier.width(8.dp))
                  Text(
                    text = DateTimeFormatting.dateAndTime(session.start, session.end),
                    color = GraphqlConfTheme.colors.text,
                    style = GraphqlConfTheme.typography.bodyMedium,
                    modifier = Modifier.align(Alignment.CenterVertically),
                  )
                }
                Row {
                  Image(
                    painter = painterResource(Res.drawable.location),
                    colorFilter = ColorFilter.tint(GraphqlConfTheme.colors.secondary),
                    contentDescription = "Room",
                    modifier = Modifier.align(Alignment.CenterVertically),
                  )
                  Spacer(modifier = Modifier.width(8.dp))
                  Text(
                    text = session.room?.name ?: "",
                    color = GraphqlConfTheme.colors.text,
                    style = GraphqlConfTheme.typography.bodyMedium,
                    modifier = Modifier.align(Alignment.CenterVertically),
                  )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Badges(
                  eventTypes = listOf(session.event_type),
                )
              }
              Spacer(modifier = Modifier.height(16.dp))
            }
          }
          if (session.description.isNotEmpty()) {
            HorizontalDivider(color = GraphqlConfTheme.colors.secondaryDimmed, thickness = 1.dp)
            PaddingRow(modifier = Modifier.height(IntrinsicSize.Min)) {
              Column(modifier = Modifier.padding(vertical = 16.dp, horizontal = 8.dp).weight(1f)) {
                Text(
                  text = stringResource(Res.string.session_description),
                  color = GraphqlConfTheme.colors.text,
                  style = GraphqlConfTheme.typography.h2,
                )
                Spacer(
                  modifier = Modifier.height(16.dp)
                )
                Text(
                  text = session.description,
                  color = GraphqlConfTheme.colors.text,
                  style = GraphqlConfTheme.typography.bodyMedium,
                )
              }
            }
          }
          HorizontalDivider(color = GraphqlConfTheme.colors.secondaryDimmed, thickness = 1.dp)
          if (session.speakers.isNotEmpty()) {
            PaddingRow(Modifier.height(IntrinsicSize.Min)) {
              Column(modifier = Modifier.weight(1f)) {
                Text(
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 16.dp),
                  text = stringResource(Res.string.session_speakers),
                  color = GraphqlConfTheme.colors.text,
                  style = GraphqlConfTheme.typography.h2,
                )

                session.speakers.forEachIndexed { index, speaker ->
                  HorizontalDivider(color = GraphqlConfTheme.colors.secondaryDimmed, thickness = 1.dp)
                  SpeakerCardContent(
                    name = speaker.speakerSummary.name,
                    position = speaker.speakerSummary.position,
                    company = speaker.speakerSummary.company,
                    about = speaker.speakerSummary.about,
                    avatar = speaker.speakerSummary.avatar,
                    eventTypes = speaker.speakerSummary.sessions.map { it.event_subtype },
                    index = index,
                    modifier = Modifier.padding(horizontal = 8.dp).clickable {
                      onSpeaker(speaker.speakerSummary.id)
                    },
                  )
                }
              }
            }
            HorizontalDivider(color = GraphqlConfTheme.colors.secondaryDimmed, thickness = 1.dp)
          }
          if (session.resources.isNotEmpty()) {
            val uriHandler = LocalUriHandler.current
            PaddingRow(Modifier.height(IntrinsicSize.Min)) {
              Column(modifier = Modifier.weight(1f).padding(horizontal = 8.dp, vertical = 16.dp)) {
                Text(
                  text = stringResource(Res.string.session_resources),
                  color = GraphqlConfTheme.colors.text,
                  style = GraphqlConfTheme.typography.h2,
                )
                Spacer(modifier = Modifier.height(8.dp))
                session.resources.forEach { resource ->
                  Row(
                    modifier = Modifier
                      .fillMaxWidth()
                      .clickable { uriHandler.openUri(resource.url) }
                      .padding(vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                  ) {
                    Text(
                      text = resource.name,
                      color = GraphqlConfTheme.colors.text,
                      style = GraphqlConfTheme.typography.bodyMedium,
                      modifier = Modifier.weight(1f),
                    )
                    Image(
                      painter = painterResource(Res.drawable.arrow_left),
                      contentDescription = stringResource(Res.string.open_resource),
                      modifier = Modifier.size(24.dp).rotate(180f),
                      colorFilter = ColorFilter.tint(GraphqlConfTheme.colors.text),
                    )
                  }
                }
              }
            }
            HorizontalDivider(color = GraphqlConfTheme.colors.secondaryDimmed, thickness = 1.dp)
          }
          if (session.speakers.isNotEmpty()) {
            FeedbackSection(sessionId = session.id)
          }
        }
        PaddingRow(Modifier.fillMaxHeight()) {
          Spacer(modifier = Modifier.weight(1f))
        }
      }
    }
  }
}

@Composable
private fun FeedbackSection(sessionId: String) {
  var rating by remember(sessionId) { mutableStateOf<Rating?>(null) }
  var comment by remember(sessionId) { mutableStateOf("") }
  var submitting by remember(sessionId) { mutableStateOf(false) }
  var submitted by remember(sessionId) { mutableStateOf(false) }
  var error by remember(sessionId) { mutableStateOf<Boolean>(false) }
  val scope = rememberCoroutineScope()
  val textColor = GraphqlConfTheme.colors.text

  PaddingRow(Modifier.height(IntrinsicSize.Min)) {
    Column(modifier = Modifier.weight(1f).padding(horizontal = 8.dp, vertical = 16.dp)) {
      Text(
        text = stringResource(Res.string.feedback_title),
        color = textColor,
        style = GraphqlConfTheme.typography.h2,
      )

      if (submitted) {
        Spacer(modifier = Modifier.height(16.dp))
        Text(
          text = stringResource(Res.string.feedback_thanks),
          color = textColor,
          style = GraphqlConfTheme.typography.bodyMedium,
        )
        return@Column
      }

      Spacer(modifier = Modifier.height(16.dp))
      Row(modifier = Modifier.fillMaxWidth()) {
        RatingChip(
          label = stringResource(Res.string.feedback_rating_disappointed),
          selected = rating == Rating.Disappointed,
          enabled = !submitting,
          onClick = { rating = Rating.Disappointed },
          modifier = Modifier.weight(1f),
        )
        Spacer(modifier = Modifier.width(8.dp))
        RatingChip(
          label = stringResource(Res.string.feedback_rating_neutral),
          selected = rating == Rating.Neutral,
          enabled = !submitting,
          onClick = { rating = Rating.Neutral },
          modifier = Modifier.weight(1f),
        )
        Spacer(modifier = Modifier.width(8.dp))
        RatingChip(
          label = stringResource(Res.string.feedback_rating_happy),
          selected = rating == Rating.Happy,
          enabled = !submitting,
          onClick = { rating = Rating.Happy },
          modifier = Modifier.weight(1f),
        )
      }

      Spacer(modifier = Modifier.height(16.dp))
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .heightIn(min = 96.dp)
          .border(width = 1.dp, color = GraphqlConfTheme.colors.textDimmed)
          .padding(12.dp),
      ) {
        BasicTextField(
          value = comment,
          onValueChange = { comment = it },
          enabled = !submitting,
          modifier = Modifier.fillMaxWidth(),
          textStyle = GraphqlConfTheme.typography.bodyMedium.copy(color = textColor),
          cursorBrush = SolidColor(textColor),
          decorationBox = { innerTextField ->
            if (comment.isEmpty()) {
              Text(
                text = stringResource(Res.string.feedback_comment_placeholder),
                style = GraphqlConfTheme.typography.bodyMedium,
                color = GraphqlConfTheme.colors.textDimmed,
              )
            }
            innerTextField()
          },
        )
      }

      if (error) {
        Spacer(modifier = Modifier.height(8.dp))
        Text(
          text = stringResource(Res.string.oh_no),
          color = ColorValues.primaryBase,
          style = GraphqlConfTheme.typography.bodySmall,
        )
      }

      Spacer(modifier = Modifier.height(16.dp))
      val submitEnabled = rating != null && !submitting
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .border(
            width = 1.dp,
            color = if (submitEnabled) textColor else GraphqlConfTheme.colors.textDimmed,
          )
          .clickable(enabled = submitEnabled) {
            val selected = rating ?: return@clickable
            submitting = true
            error = false
            scope.launch {
              val response = apolloClient.mutation(
                SubmitFeedbackMutation(
                  FeedbackInput(
                    userId = userId(),
                    sessionId = sessionId,
                    rating = selected,
                    comment = comment,
                  )
                )
              ).execute()
              submitting = false
              if (response.data?.submitFeedback == true) {
                submitted = true
              } else {
                error = true
              }
            }
          }
          .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center,
      ) {
        Text(
          text = stringResource(
            if (submitting) Res.string.feedback_submitting else Res.string.feedback_submit
          ),
          color = if (submitEnabled) textColor else GraphqlConfTheme.colors.textDimmed,
          style = GraphqlConfTheme.typography.bodyMedium,
        )
      }
    }
  }
}

@Composable
private fun RatingChip(
  label: String,
  selected: Boolean,
  enabled: Boolean,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
) {
  val borderColor = if (selected) ColorValues.primaryBase else GraphqlConfTheme.colors.textDimmed
  val textColor = if (selected) ColorValues.primaryBase else GraphqlConfTheme.colors.text
  Box(
    modifier = modifier
      .border(width = 1.dp, color = borderColor)
      .clickable(enabled = enabled, onClick = onClick)
      .padding(vertical = 12.dp),
    contentAlignment = Alignment.Center,
  ) {
    Text(
      text = label,
      color = textColor,
      style = GraphqlConfTheme.typography.bodyMedium,
    )
  }
}

