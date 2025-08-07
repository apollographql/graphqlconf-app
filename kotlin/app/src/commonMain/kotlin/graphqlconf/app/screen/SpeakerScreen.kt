package graphqlconf.app.screen

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import coil3.compose.LocalPlatformContext
import graphqlconf.api.GetSpeakerQuery
import graphqlconf.api.type.SocialService
import graphqlconf.app.apolloClient
import graphqlconf.app.misc.ApolloWrapper
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.app.misc.PaddingRow
import graphqlconf.app.positionAndCompany
import graphqlconf.design.component.Badges
import graphqlconf.design.component.SpeakerAvatar
import graphqlconf.design.component.TopMenuButton
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.arrow_left
import graphqlconf_app.app.generated.resources.back
import graphqlconf_app.app.generated.resources.facebook
import graphqlconf_app.app.generated.resources.globe
import graphqlconf_app.app.generated.resources.instagram
import graphqlconf_app.app.generated.resources.linkedin
import graphqlconf_app.app.generated.resources.meet_the_speaker
import graphqlconf_app.app.generated.resources.nav_destination_speaker
import graphqlconf_app.app.generated.resources.twitter
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource

@Composable
fun SpeakerScreen(id: String, onBack: () -> Unit) {
  Column {
    Header(
      state = MainHeaderContainerState.Title,
      titleContent = {
        MainHeaderTitleBar(
          title = stringResource(Res.string.nav_destination_speaker),
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
      apolloClient.query(GetSpeakerQuery(id)).toFlow()
    }.collectAsStateWithLifecycle(null)

    ApolloWrapper(responseState.value) {
      val speaker = it.speaker
      if (speaker == null) {
        Box {
          Text(
            text = "Speaker not found",
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
            Column(modifier = Modifier.weight(1f)) {
              Spacer(modifier = Modifier.height(8.dp))
              Text(
                modifier = Modifier.padding(horizontal = 8.dp),
                text = stringResource(Res.string.meet_the_speaker),
                color = GraphqlConfTheme.colors.secondaryDimmed,
                style = GraphqlConfTheme.typography.bodyMedium,
              )
              Spacer(modifier = Modifier.height(8.dp))
              Text(
                modifier = Modifier.padding(horizontal = 8.dp),
                text = speaker.speakerSummary.name,
                color = GraphqlConfTheme.colors.text,
                style = GraphqlConfTheme.typography.h1,
              )
              Spacer(modifier = Modifier.height(16.dp))
              Text(
                modifier = Modifier.padding(horizontal = 8.dp),
                text = speaker.speakerSummary.positionAndCompany,
                color = GraphqlConfTheme.colors.text,
                style = GraphqlConfTheme.typography.bodyMedium,
              )
              Spacer(modifier = Modifier.height(8.dp))
              Badges(
                eventTypes = speaker.speakerSummary.sessions.map { it.event_subtype },
                modifier = Modifier.padding(horizontal = 8.dp),
              )

              Spacer(modifier = Modifier.height(8.dp))
              SpeakerAvatar(speaker.speakerSummary.avatar, modifier = Modifier.fillMaxWidth().aspectRatio(4f/3f))
            }
          }
          HorizontalDivider(color = GraphqlConfTheme.colors.secondaryDimmed, thickness = 1.dp)
          PaddingRow {
            Row(
              modifier = Modifier.weight(1f),
              horizontalArrangement = Arrangement.End,
            ) {
              speaker.socialUrls.forEach {
                SocialUrl(it)
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


private fun SocialService.toResource(): DrawableResource {
  return when(this) {
    SocialService.Instagram -> Res.drawable.instagram
    SocialService.Twitter -> Res.drawable.twitter
    SocialService.LinkedIn -> Res.drawable.linkedin
    SocialService.Facebook -> Res.drawable.facebook
    SocialService.Other,
    SocialService.UNKNOWN__ ->  Res.drawable.globe
  }
}

@Composable
fun SocialUrl(url: GetSpeakerQuery.SocialUrl, modifier: Modifier = Modifier) {
  val uriHandler = LocalUriHandler.current
  val lineColor = GraphqlConfTheme.colors.secondaryDimmed
  Image(
    painter = painterResource(url.service.toResource()),
    contentDescription = url.service.name,
    colorFilter = ColorFilter.tint(GraphqlConfTheme.colors.text),
    modifier = modifier.padding(8.dp).clickable {
      uriHandler.openUri(url.url)
    }.drawBehind {
      val path = Path()
      path.moveTo(0f, 0f)
      path.lineTo(0f, size.height)
      path.lineTo(size.width, size.height)
      drawPath(
        path = path,
        color = lineColor,
        style = Stroke(width = 1.dp.value),
      )
    },
  )
}