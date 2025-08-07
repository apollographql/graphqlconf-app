package graphqlconf.design.component


import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.graphics.CompositingStrategy
import androidx.compose.ui.graphics.TileMode
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf.design.theme.PreviewHelper
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.speaker_photo
import graphqlconf_app.app.generated.resources.user
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
fun SpeakerCard(
  name: String,
  position: String,
  company: String,
  about: String,
  avatar: String,
  eventTypes: List<String>,
  index: Int,
  modifier: Modifier = Modifier,
  onClick: () -> Unit,
) {
  Box(
    modifier = modifier
      .border(width = 1.dp, color = GraphqlConfTheme.colors.textDimmed)
      .clickable(onClick = onClick)
      .fillMaxWidth()
      .height(IntrinsicSize.Min)
      .background(GraphqlConfTheme.colors.surface)
  ) {
    SpeakerCardContent(
      name = name,
      position = position,
      company = company,
      about = about,
      avatar = avatar,
      eventTypes = eventTypes,
      index = index,
    )
  }
}

@Composable
fun SpeakerCardContent(
  name: String,
  position: String,
  company: String,
  about: String,
  avatar: String,
  eventTypes: List<String>,
  index: Int,
  modifier: Modifier = Modifier,
) {
  val textColor = GraphqlConfTheme.colors.text

  Row(
    modifier = modifier
      .fillMaxWidth()
      .height(IntrinsicSize.Min)
      .padding(16.dp)
  ) {
    StripedSpeakerAvatar(
      avatar = avatar,
      modifier = Modifier.size(92.dp),
      index = index,
    )
    Spacer(modifier = Modifier.width(16.dp))
    Column(modifier = Modifier.fillMaxSize()) {
      Text(
        text = name,
        style = GraphqlConfTheme.typography.bodyLarge,
        color = textColor
      )
      Text(
        text = listOf(position, company).filter { it.isNotEmpty() }.joinToString(", "),
        style = GraphqlConfTheme.typography.bodySmall,
        color = textColor
      )
      Badges(eventTypes = eventTypes, modifier = Modifier.padding(vertical = 8.dp))
      Text(
        text = about,
        style = GraphqlConfTheme.typography.bodySmall,
        color = textColor,
        overflow = TextOverflow.Ellipsis,
        minLines = 3,
        maxLines = 3,
        modifier = Modifier.fillMaxWidth()
      )
    }
  }
}

@Composable
fun StripedSpeakerAvatar(
  avatar: String,
  modifier: Modifier = Modifier,
  index: Int
) {
  Box(modifier = modifier.aspectRatio(1f)) {
    SpeakerAvatar(avatar)
    GreenStripes(index)
  }
}

@Composable
fun SpeakerAvatar(
  avatar: String,
  modifier: Modifier = Modifier,
) {
  Box(
    modifier = modifier
  ) {

    val loaded = remember { mutableStateOf(false) }
    val colorFilter = ColorFilter.colorMatrix(ColorMatrix().apply { setToSaturation(0.1f) })
    AsyncImage(
      model = avatar,
      contentDescription = stringResource(Res.string.speaker_photo),
      contentScale = ContentScale.Crop,
      onSuccess = { loaded.value = true },
      colorFilter = colorFilter,
      modifier = Modifier.fillMaxSize()
    )
    if (!loaded.value) {
      Image(
        painter = painterResource(Res.drawable.user),
        contentDescription = stringResource(Res.string.speaker_photo),
        modifier = Modifier.background(ColorValues.white70).fillMaxSize(),
        contentScale = ContentScale.Crop,
        colorFilter = colorFilter,
        alpha = 0.4f
      )
    }
    Canvas(modifier = Modifier.fillMaxSize()) {
      drawRect(
        color = ColorValues.secondaryLighter.copy(alpha = 1f),
        topLeft = Offset(0f, 0f),
        size = size,
        blendMode = BlendMode.Multiply
      )
    }
  }
}
@Composable
fun GreenStripes(
  index: Int,
) {
  Canvas(
    modifier = Modifier.fillMaxSize().graphicsLayer(compositingStrategy = CompositingStrategy.Offscreen)
      .clipToBounds()
  ) {
    var i = 0f
    val stripeWidth = 8.dp.value
    while (i < size.width) {
      drawRect(
        color = Color(0xffc3f655),
        topLeft = Offset(i, 0f),
        size = Size(stripeWidth, size.height)
      )
      i += 2 * stripeWidth
    }
    when (index % 2) {
      0 -> {
        val i = (index / 2)
        val x = (i % 2)
        val y = (i + 1) % 2
        drawRect(
          brush = Brush.radialGradient(
            colors = listOf(Color.White, Color.Transparent),
            center = Offset(x * size.width, y * size.height),
            radius = size.width / 2,
            tileMode = TileMode.Clamp
          ), topLeft = Offset(0f, 0f), size = size, blendMode = BlendMode.DstIn
        )
      }

      1 -> {
        val i = (index / 2)
        val x = (i % 2)
        val y = (i + 1) % 2

        drawRect(
          brush = Brush.linearGradient(
            colors = listOf(Color.White, Color.Transparent),
            start = Offset(x * size.width, y * size.height),
            end = Offset(size.width/2, size.height/2),
            tileMode = TileMode.Clamp
          ), topLeft = Offset(0f, 0f), size = size, blendMode = BlendMode.DstIn
        )
      }
    }
  }

}

@Preview
@Composable
fun SpeakerCardPreview() {
  PreviewHelper {
    SpeakerCard(
      name = "Anthony Miller",
      position = "Engineer - iOS",
      company = "Apollo",
      about = "Anthony Miller leads the development of Apollo GraphQL’s iOS client library. He has a passion for client-side infrastructure, quality API design, and writing far too many unit tests. Outside of Apollo, Anthony enjoys board gaming with friends, watching movies, and relaxing by the pool.",
      avatar = "https://avatars.sched.co/5/01/21066803/avatar.jpg.320x320px.jpg?46c",
      index = 1,
      eventTypes = listOf("keynote sessions", "unconference"),
      onClick = { }
    )
  }
}
