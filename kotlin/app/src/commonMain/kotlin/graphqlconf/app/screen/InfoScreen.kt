package graphqlconf.app.screen

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.material3.VerticalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Alignment.Companion.CenterHorizontally
import androidx.compose.ui.Alignment.Companion.CenterVertically
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.*
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource

@Composable
fun InfoScreen(navigateToLicenses: () -> Unit, navigateToFloorPlan: () -> Unit) {
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
      Text(
        text = stringResource(Res.string.app_description),
        style = GraphqlConfTheme.typography.bodyMedium,
        color = GraphqlConfTheme.colors.text,
        modifier = Modifier.padding(horizontal = 16.dp),
      )
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
          title = stringResource(Res.string.onsite_resources),
          url = "https://graphql.org/conf/2025/resources/#onsite-resources",
        )
        Spacer(modifier = Modifier.height(16.dp))
        InAppLinkCard(
          title = stringResource(Res.string.floor_plan),
          onClick = {
            navigateToFloorPlan()
          }
        )
        Spacer(modifier = Modifier.height(16.dp))
        InAppLinkCard(
          title = stringResource(Res.string.licenses),
          onClick = {
            navigateToLicenses()
          }
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

@Composable
fun InAppLinkCard(title: String, onClick: () -> Unit) {
  Text(
    text = title,
    color = GraphqlConfTheme.colors.text,
    style = GraphqlConfTheme.typography.bodyLarge,
    modifier = Modifier
      .fillMaxSize()
      .border(width = 1.dp, color = GraphqlConfTheme.colors.textDimmed)
      .background(GraphqlConfTheme.colors.surface)
      .padding(8.dp)
      .clickable {
        onClick()
      },
  )
}

private val Int.spAsDp: Dp
  @Composable
  get() = with(LocalDensity.current) { this@spAsDp.sp.toDp() }