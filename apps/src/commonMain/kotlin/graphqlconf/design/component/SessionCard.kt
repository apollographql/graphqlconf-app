package graphqlconf.design.component


import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Divider
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.unit.dp
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf.design.theme.PreviewHelper
import graphqlconf_2025_apps.apps.generated.resources.Res
import graphqlconf_2025_apps.apps.generated.resources.location
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.ui.tooling.preview.Preview

enum class TalkStatus {
  Past, Live, Upcoming,
}

private val CardTalkShape = RoundedCornerShape(8.dp)

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
    Column(modifier = Modifier.padding(8.dp)) {
      Text(
        text = title,
        style = GraphqlConfTheme.typography.h2,
        color = textColor,
        maxLines = 2,
        modifier = modifier,
      )
      Text(
        text = speakers.joinToString(","),
        color = GraphqlConfTheme.colors.primaryText,
        style = GraphqlConfTheme.typography.text,
        maxLines = 1,
      )
    }

    Divider(
      thickness = 1.dp,
      color = borderColor,
    )

    Row(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
      Image(
        painter = painterResource(Res.drawable.location),
        contentDescription = "Location",
        colorFilter = ColorFilter.tint(ColorValues.rhodamine)
      )
      Spacer(modifier = Modifier.width(4.dp))
      Text(
        text = venue,
        style = GraphqlConfTheme.typography.text,
        color = GraphqlConfTheme.colors.primaryText,
        modifier = Modifier.weight(1f)
      )
      Text(
        text = time,
        style = GraphqlConfTheme.typography.text,
        color = GraphqlConfTheme.colors.primaryText,
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
      eventType = "Keynote",
      speakers = listOf("Jeff Auriemma"),
      venue = "Grote Zaal",
      time = "10:00 - 12:00",
      onClick = {},
    )
  }
}
