package graphqlconf.design.component


import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.dp
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf.design.theme.PreviewHelper
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.bookmark
import graphqlconf_app.app.generated.resources.bookmark_filled
import graphqlconf_app.app.generated.resources.location
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
fun SessionCard(
  title: String,
  eventType: String?,
  speakers: List<String>,
  venue: String,
  time: String,
  bookmarked: Boolean,
  onClick: () -> Unit,
  onBookmarkChanged: (Boolean) -> Unit,
  modifier: Modifier = Modifier,
) {
  val backgroundColor = Color.Transparent
  val borderColor = GraphqlConfTheme.colors.textDimmed
  val textColor = GraphqlConfTheme.colors.text

  Column(
    modifier
      .border(width = 1.dp, color = borderColor)
      .clickable(onClick = onClick)
      .background(backgroundColor)
  ) {
    Row(modifier = modifier.fillMaxWidth()) {
      Column(modifier = Modifier.padding(top = 16.dp, start = 16.dp, bottom = 16.dp).weight(1f)) {
        Badges(eventTypes = listOfNotNull(eventType), modifier = Modifier.padding(bottom = 8.dp))
        Text(
          text = title,
          style = GraphqlConfTheme.typography.bodyLarge,
          color = textColor,
          maxLines = 2,
          modifier = modifier,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
          text = speakers.joinToString(", "),
          color = textColor,
          style = GraphqlConfTheme.typography.bodySmall,
          maxLines = 1,
        )
      }

      Box(
        modifier = Modifier
          .toggleable(
            value = bookmarked,
            onValueChange = onBookmarkChanged,
            role = Role.Switch,
            interactionSource = null,
            indication = null,
          )
          .padding(16.dp)
      ) {
        val iconColor by animateColorAsState(
          if (bookmarked) ColorValues.primaryBase
          else GraphqlConfTheme.colors.text
        )

        Icon(
          modifier = Modifier
            .size(24.dp),
          painter = painterResource(
            if (bookmarked) Res.drawable.bookmark_filled
            else Res.drawable.bookmark
          ),
          contentDescription = null,
          tint = iconColor,
        )
      }

    }

    Spacer(
      modifier = Modifier.height(1.dp).fillMaxWidth().background(borderColor),
    )

    Row(modifier = Modifier.fillMaxWidth().padding(top = 8.dp, start = 16.dp, end = 16.dp, bottom = 16.dp)) {
      Image(
        painter = painterResource(Res.drawable.location),
        contentDescription = "Location",
        colorFilter = ColorFilter.tint(ColorValues.primaryBase),
        modifier = Modifier.align(Alignment.CenterVertically)
      )
      Spacer(modifier = Modifier.width(4.dp))
      Text(
        text = venue,
        style = GraphqlConfTheme.typography.bodySmall,
        color = textColor,
        modifier = Modifier.weight(1f).align(Alignment.CenterVertically)
      )
      Text(
        text = time,
        style = GraphqlConfTheme.typography.bodySmall,
        color = textColor,
        modifier = Modifier.align(Alignment.CenterVertically)
      )
    }
  }
}

@Preview
@Composable
internal fun SessionCardPreview() {
  PreviewHelper {
    SessionCard(
      title = "What is the GraphQL foundation?",
      eventType = "Keynote sessions",
      speakers = listOf("Jeff Auriemma"),
      venue = "Grote Zaal",
      time = "10:00 - 12:00",
      bookmarked = false,
      onClick = {},
      onBookmarkChanged = {},
    )
  }
}
