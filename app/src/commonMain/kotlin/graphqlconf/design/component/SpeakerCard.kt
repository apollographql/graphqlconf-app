package graphqlconf.design.component


import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.painter.ColorPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import coil3.compose.LocalPlatformContext
import coil3.request.ImageRequest
import coil3.request.crossfade
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf.design.theme.eventColor
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.location
import org.jetbrains.compose.resources.painterResource

@Composable
fun SpeakerCard(
  name: String,
  position: String,
  company: String,
  about: String,
  avatar: String,
  onClick: () -> Unit,
) {
  val borderColor = GraphqlConfTheme.colors.strokeHalf
  val textColor = GraphqlConfTheme.colors.primaryText

  Row(
    modifier = Modifier
      .border(width = 1.dp, color = borderColor)
      .clickable(onClick = onClick)
      .background(GraphqlConfTheme.colors.surface)
      .padding(16.dp)
  ) {
    SpeakerAvatar(avatar)
    Column {
      Text(
        text = name,
        style = GraphqlConfTheme.typography.bodyLarge,
        color = textColor
      )
    }
    Column {
      Text(
        text = "$position, $company",
        style = GraphqlConfTheme.typography.bodyLarge,
        color = textColor
      )
    }
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

@Composable
fun SpeakerAvatar(
  photoUrl: String,
  modifier: Modifier = Modifier,
) {
  Box(modifier = modifier) {
    AsyncImage(
      model = ImageRequest.Builder(LocalPlatformContext.current)
        .data(photoUrl)
        .crossfade(true)
        .build(),
      contentDescription = null,
      modifier = modifier
        .background(GraphqlConfTheme.colors.surface),
      contentScale = ContentScale.Crop,
      error = ColorPainter(GraphqlConfTheme.colors.surface),
    )
    Canvas(modifier = Modifier.fillMaxSize()) {

    }
  }
}

