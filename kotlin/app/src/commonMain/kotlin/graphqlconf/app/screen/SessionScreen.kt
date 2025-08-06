package graphqlconf.app.screen

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
import graphqlconf.design.component.TopMenuButton
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.arrow_left
import graphqlconf_app.app.generated.resources.back
import graphqlconf_app.app.generated.resources.calendar_today
import graphqlconf_app.app.generated.resources.location
import graphqlconf_app.app.generated.resources.nav_destination_session
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource

@Composable
fun SessionScreen(id: String, onBack: () -> Unit) {
  Column(modifier = Modifier.background(GraphqlConfTheme.colors.background)) {
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
  }
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
    Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)) {
      Spacer(modifier = Modifier.width(16.dp))
      Spacer(
        modifier = Modifier.width(1.dp).background(ColorValues.secondaryLight)
      )
      Column(modifier = Modifier.weight(1f)) {
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
        Row {
          Column {
            Row {
              Image(
                painter = painterResource(Res.drawable.calendar_today),
                contentDescription = "Time",
              )
              Text(
                text = DateTimeFormatting.dateAndTime(session.start, session.end),
                color = GraphqlConfTheme.colors.primaryText,
                style = GraphqlConfTheme.typography.bodyMedium,
              )
            }
            Row {
              Image(
                painter = painterResource(Res.drawable.location),
                contentDescription = "Room",
              )
              Text(
                text = session.room?.name ?: "",
                color = GraphqlConfTheme.colors.primaryText,
                style = GraphqlConfTheme.typography.bodyMedium,
              )
            }
          }
          Badges(listOf(session.event_type))
        }

      }
      Spacer(
        modifier = Modifier.width(1.dp).background(ColorValues.secondaryLight)
      )
      Spacer(modifier = Modifier.width(16.dp))
    }
  }
}
