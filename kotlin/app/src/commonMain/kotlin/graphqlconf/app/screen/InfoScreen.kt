package graphqlconf.app.screen

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.rememberScrollableState
import androidx.compose.foundation.gestures.scrollable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.material3.VerticalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Alignment.Companion.Center
import androidx.compose.ui.Alignment.Companion.CenterHorizontally
import androidx.compose.ui.Alignment.Companion.CenterVertically
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.ModifierLocalBeyondBoundsLayout
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.app.misc.Schedule
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.arrow_left
import graphqlconf_app.app.generated.resources.bluesky
import graphqlconf_app.app.generated.resources.code_of_conduct
import graphqlconf_app.app.generated.resources.discord
import graphqlconf_app.app.generated.resources.graphql_dot_org
import graphqlconf_app.app.generated.resources.graphql_foundation
import graphqlconf_app.app.generated.resources.graphqlconf
import graphqlconf_app.app.generated.resources.health_and_safety
import graphqlconf_app.app.generated.resources.hosted_by
import graphqlconf_app.app.generated.resources.inclusion_and_diversity
import graphqlconf_app.app.generated.resources.nav_destination_info
import graphqlconf_app.app.generated.resources.nav_destination_speakers
import graphqlconf_app.app.generated.resources.privacy_policy
import graphqlconf_app.app.generated.resources.this_year
import graphqlconf_app.app.generated.resources.twitter
import graphqlconf_app.app.generated.resources.youtube
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource

@Composable
fun InfoScreen() {
  Column(modifier = Modifier.background(GraphqlConfTheme.colors.background).fillMaxSize()) {
    Header(
      state = MainHeaderContainerState.Title,
      titleContent = {
        MainHeaderTitleBar(
          title = stringResource(Res.string.nav_destination_info),
        )
      },
    )

    Column(modifier = Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState())) {
      Spacer(modifier = Modifier.height(32.dp))
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .background(ColorValues.primaryBase),
        horizontalAlignment = CenterHorizontally
      ) {
        Spacer(modifier = Modifier.height(16.dp))
        Row {
          Text(
            text = stringResource(Res.string.graphqlconf),
            color = ColorValues.white100,
            style = GraphqlConfTheme.typography.h1,
          )
          Text(
            text = " ",
            color = ColorValues.white100,
            style = GraphqlConfTheme.typography.h1,
          )
          Text(
            text = stringResource(Res.string.this_year),
            color = ColorValues.secondaryBase,
            style = GraphqlConfTheme.typography.h1,
          )
        }
        Spacer(modifier = Modifier.height(16.dp))
        Row(verticalAlignment = CenterVertically) {
          Text(
            text = stringResource(Res.string.hosted_by),
            color = ColorValues.white100,
            style = GraphqlConfTheme.typography.bodyMedium,
          )
          Spacer(modifier = Modifier.width(8.spAsDp))
          Image(
            painter = painterResource(Res.drawable.graphql_foundation),
            contentDescription = "GraphQL Foundation",
            modifier = Modifier.height(40.spAsDp)
          )
        }
        Spacer(modifier = Modifier.height(16.dp))
      }
      Spacer(modifier = Modifier.height(32.dp))
      Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        LinkCard(
          title = stringResource(Res.string.code_of_conduct),
          url = "https://graphql.org/conf/2025/resources/#code-of-conduct",
        )
        Spacer(modifier = Modifier.height(16.dp))
        LinkCard(
          title = stringResource(Res.string.privacy_policy),
          url = "https://lfprojects.org/policies/privacy-policy/",
        )
        Spacer(modifier = Modifier.height(16.dp))
        LinkCard(
          title = stringResource(Res.string.health_and_safety),
          url = "https://graphql.org/conf/2025/resources/#health--safety",
        )
        Spacer(modifier = Modifier.height(16.dp))
        LinkCard(
          title = stringResource(Res.string.inclusion_and_diversity),
          url = "https://graphql.org/conf/2025/resources/#inclusion--accessibility",
        )
        Spacer(modifier = Modifier.height(16.dp))
        LinkCard(
          title = stringResource(Res.string.graphql_dot_org),
          url = "https://graphql.org",
        )
        Spacer(modifier = Modifier.height(32.dp))
      }
    }
    HorizontalDivider(color = GraphqlConfTheme.colors.textDimmed, thickness = 1.dp)
    Row(modifier = Modifier.height(IntrinsicSize.Min).align(Alignment.End)) {
      Spacer(modifier = Modifier.width(16.dp))
      VerticalDivider(color = GraphqlConfTheme.colors.textDimmed, thickness = 1.dp)
      IconCard(
        painter = painterResource(Res.drawable.twitter),
        url = "https://x.com/GraphQL",
      )
      VerticalDivider(color = GraphqlConfTheme.colors.textDimmed, thickness = 1.dp)
      IconCard(
        painter = painterResource(Res.drawable.discord),
        url = "https://discord.graphql.org",
      )
      VerticalDivider(color = GraphqlConfTheme.colors.textDimmed, thickness = 1.dp)
      IconCard(
        painter = painterResource(Res.drawable.bluesky),
        url = "https://bsky.app/profile/graphql.org",
      )
      VerticalDivider(color = GraphqlConfTheme.colors.textDimmed, thickness = 1.dp)
      IconCard(
        painter = painterResource(Res.drawable.youtube),
        url = "https://www.youtube.com/@GraphQLFoundation",
      )
      VerticalDivider(color = GraphqlConfTheme.colors.textDimmed, thickness = 1.dp)
      Spacer(modifier = Modifier.width(16.dp))
    }
    HorizontalDivider(color = GraphqlConfTheme.colors.textDimmed, thickness = 1.dp)
    Spacer(modifier = Modifier.height(16.dp))
  }
}

@Composable
fun IconCard(painter: Painter, url: String) {
  val uriHandler = LocalUriHandler.current

  Image(
    painter = painter,
    contentDescription = "Open link",
    modifier = Modifier.size(64.dp).padding(16.dp).clickable {
      uriHandler.openUri(url)
    },
    colorFilter = ColorFilter.tint(GraphqlConfTheme.colors.text),
    contentScale = ContentScale.Fit,
  )
}

@Composable
fun LinkCard(title: String, url: String) {
  val uriHandler = LocalUriHandler.current
  Row(
    modifier = Modifier
      .border(width = 1.dp, color = GraphqlConfTheme.colors.textDimmed)
      .background(GraphqlConfTheme.colors.surface)
      .clickable {
        uriHandler.openUri(url)
      },
    verticalAlignment = CenterVertically,
  ) {
    Text(
      text = title,
      color = GraphqlConfTheme.colors.text,
      style = GraphqlConfTheme.typography.bodyLarge,
      modifier = Modifier.weight(1f).padding(8.dp),
    )
    Image(
      painter = painterResource(Res.drawable.arrow_left),
      contentDescription = "Open link",
      modifier = Modifier.size(24.dp).rotate(180f),
      colorFilter = ColorFilter.tint(GraphqlConfTheme.colors.text)
    )
    Spacer(modifier = Modifier.width(8.dp))
  }
}

private val Int.spAsDp: Dp
  @Composable
  get() = with(LocalDensity.current) { this@spAsDp.sp.toDp() }