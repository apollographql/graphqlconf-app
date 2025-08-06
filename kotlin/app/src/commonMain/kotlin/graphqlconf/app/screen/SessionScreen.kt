package graphqlconf.app.screen

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.scrollable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.material3.VerticalDivider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.apollographql.apollo.api.ApolloResponse
import graphqlconf.api.GetScheduleItemsQuery
import graphqlconf.api.GetSessionQuery
import graphqlconf.app.DateTimeFormatting
import graphqlconf.app.apolloClient
import graphqlconf.app.misc.ApolloWrapper
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.design.component.Badges
import graphqlconf.design.component.SpeakerCard
import graphqlconf.design.component.SpeakerCardContent
import graphqlconf.design.component.TopMenuButton
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.arrow_left
import graphqlconf_app.app.generated.resources.back
import graphqlconf_app.app.generated.resources.calendar_today
import graphqlconf_app.app.generated.resources.location
import graphqlconf_app.app.generated.resources.nav_destination_session
import graphqlconf_app.app.generated.resources.nav_destination_speakers
import graphqlconf_app.app.generated.resources.session_description
import graphqlconf_app.app.generated.resources.session_speakers
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
              contentDescription = stringResource(Res.string.back),
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
            color = GraphqlConfTheme.colors.primaryText,
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
              color = GraphqlConfTheme.colors.primaryText,
              style = GraphqlConfTheme.typography.h2,
              text = session.speakers.joinToString(", ") { it.speakerSummary.name },
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
              color = GraphqlConfTheme.colors.primaryText,
              style = GraphqlConfTheme.typography.h1,
              text = session.title,
            )
            Spacer(modifier = Modifier.height(16.dp))
            Column {
              Row {
                Image(
                  painter = painterResource(Res.drawable.calendar_today),
                  contentDescription = "Time",
                  colorFilter = ColorFilter.tint(ColorValues.secondaryLight),
                  modifier = Modifier.align(Alignment.CenterVertically),
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                  text = DateTimeFormatting.dateAndTime(session.start, session.end),
                  color = GraphqlConfTheme.colors.primaryText,
                  style = GraphqlConfTheme.typography.bodyMedium,
                  modifier = Modifier.align(Alignment.CenterVertically),
                )
              }
              Row {
                Image(
                  painter = painterResource(Res.drawable.location),
                  colorFilter = ColorFilter.tint(ColorValues.secondaryLight),
                  contentDescription = "Room",
                  modifier = Modifier.align(Alignment.CenterVertically),
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                  text = session.room?.name ?: "",
                  color = GraphqlConfTheme.colors.primaryText,
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
          HorizontalDivider(color = ColorValues.secondaryLight, thickness = 1.dp)
          PaddingRow(modifier = Modifier.height(IntrinsicSize.Min)) {
            Column(modifier = Modifier.padding(vertical = 16.dp, horizontal = 8.dp).weight(1f)) {
              Text(
                text = stringResource(Res.string.session_description),
                color = GraphqlConfTheme.colors.primaryText,
                style = GraphqlConfTheme.typography.h2,
              )
              Spacer(
                modifier = Modifier.height(16.dp)
              )
              Text(
                text = session.description,
                color = GraphqlConfTheme.colors.primaryText,
                style = GraphqlConfTheme.typography.bodyMedium,
              )
            }
          }
        }
        HorizontalDivider(color = ColorValues.secondaryLight, thickness = 1.dp)
        PaddingRow(Modifier.height(IntrinsicSize.Min)) {
          Column(modifier = Modifier.weight(1f)) {
            Text(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 16.dp),
              text = stringResource(Res.string.session_speakers),
              color = GraphqlConfTheme.colors.primaryText,
              style = GraphqlConfTheme.typography.h2,
            )

            session.speakers.forEachIndexed { index, speaker ->
              HorizontalDivider(color = ColorValues.secondaryLight, thickness = 1.dp)
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
      }
      PaddingRow(Modifier.fillMaxHeight()) {
        Spacer(modifier = Modifier.weight(1f))
      }
    }
    }
  }
}

@Composable
private fun PaddingRow(modifier: Modifier = Modifier, content: @Composable RowScope.() -> Unit) {
  Row(
    modifier = modifier
      .fillMaxWidth()
      .padding(horizontal = 16.dp)
  ) {
    VerticalDivider(color = ColorValues.secondaryLight, thickness = 1.dp)
    content()
    VerticalDivider(color = ColorValues.secondaryLight, thickness = 1.dp)
  }
}
