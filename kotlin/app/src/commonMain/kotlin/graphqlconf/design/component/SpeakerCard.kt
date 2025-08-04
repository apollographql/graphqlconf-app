package graphqlconf.design.component


import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.CompositingStrategy
import androidx.compose.ui.graphics.TileMode
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.painter.ColorPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import coil3.compose.AsyncImagePainter
import coil3.compose.LocalPlatformContext
import coil3.compose.SubcomposeAsyncImage
import coil3.compose.SubcomposeAsyncImageContent
import coil3.request.ImageRequest
import coil3.request.crossfade
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf.design.theme.PreviewHelper
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
fun SpeakerCard(
  name: String,
  position: String,
  company: String,
  about: String,
  avatar: String,
  index: Int,
  onClick: () -> Unit,
) {
  val borderColor = GraphqlConfTheme.colors.strokeHalf
  val textColor = GraphqlConfTheme.colors.primaryText

  Row(
    modifier = Modifier
      .border(width = 1.dp, color = borderColor)
      .clickable(onClick = onClick)
      .fillMaxWidth()
      .background(GraphqlConfTheme.colors.surface)
      .padding(16.dp)
  ) {
    SpeakerAvatar(
      avatar,
      modifier = Modifier.width(92.dp),
      index,
    )
    Spacer(modifier = Modifier.width(8.dp))
    Column(modifier = Modifier.fillMaxSize()) {
      Text(
        text = name,
        style = GraphqlConfTheme.typography.bodyLarge,
        color = textColor
      )
      Text(
        text = "$position, $company",
        style = GraphqlConfTheme.typography.bodySmall,
        color = textColor
      )
      Spacer(Modifier.weight(1f))
      Text(
        text = about,
        style = GraphqlConfTheme.typography.bodySmall,
        color = textColor,
        maxLines = 2,
        overflow = TextOverflow.Ellipsis,
      )
    }
  }
}

@Composable
fun SpeakerAvatar(
  avatar: String,
  modifier: Modifier = Modifier,
  index: Int
) {
  Box(modifier = modifier.aspectRatio(1f)) {
    SubcomposeAsyncImage(
      model = avatar.fixIfNeeded(),
      contentDescription = null
    ) {
      val state by painter.state.collectAsState()
      if (state is AsyncImagePainter.State.Success) {
        SubcomposeAsyncImageContent()
        Canvas(modifier = Modifier.fillMaxSize()) {
          drawRect(color = ColorValues.secondaryLighter.copy(alpha = 0.5f), topLeft = Offset(0f, 0f), size = size)
        }
        Canvas(
          modifier = Modifier.fillMaxSize().graphicsLayer(compositingStrategy = CompositingStrategy.Offscreen)
            .clipToBounds()
        ) {
          var i = 0f
          while (i < size.width) {
            drawRect(
              color = Color(0xffc3f655),
              topLeft = Offset(i, 0f),
              size = Size(12.dp.value, size.height)
            )
            i += 2 * 12.dp.value
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
    }
  }
}

private fun String.fixIfNeeded(): String {
  return if (startsWith("//")) {
    "http:$this"
  } else {
    this
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
      onClick = { }
    )
  }
}
