package graphqlconf.design.component


import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.unit.dp
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf.design.theme.PreviewHelper
import graphqlconf.design.theme.eventColor
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.location
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
fun SessionCard(
  title: String,
  eventType: String?,
  speakers: List<String>,
  venue: String,
  time: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
) {
  val backgroundColor = Color.Transparent
  val borderColor = GraphqlConfTheme.colors.strokeHalf
  val textColor = GraphqlConfTheme.colors.primaryText

  Column(
    modifier
      .border(width = 1.dp, color = borderColor)
      .clickable(onClick = onClick)
      .background(backgroundColor)
  ) {
    Column(modifier = Modifier.padding(top = 16.dp, start = 16.dp, end = 16.dp, bottom = 16.dp)) {
      if (eventType != null ) {
        val color = eventColor(eventType)
        if (color != null) {
          Text(
            text =  eventType.uppercase(),
            color = textColor,
            style = GraphqlConfTheme.typography.badge,
            modifier = Modifier.border(1.dp, color = color).background(color.copy(alpha = 0.3f)).padding(4.dp)
          )
          Spacer(modifier = Modifier.height(8.dp))
        }
      }
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
      onClick = {},
    )
  }
}
