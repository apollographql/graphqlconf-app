package graphqlconf.app.misc

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedContentTransitionScope.SlideDirection
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import graphqlconf.design.theme.GraphqlConfTheme

enum class MainHeaderContainerState {
  Title,
  Search,
}

@Composable
fun Header(
  state: MainHeaderContainerState,
  modifier: Modifier = Modifier,
  titleContent: @Composable () -> Unit = {},
  searchContent: @Composable () -> Unit = {},
) {
  AnimatedContent(
    targetState = state,
    transitionSpec = {
      (fadeIn(tween(50)) + slideIntoContainer(SlideDirection.Down)) togetherWith
        (fadeOut(tween(50)) + slideOutOfContainer(SlideDirection.Up))
    },
    modifier = modifier
      .height(48.dp)
      .fillMaxWidth()
      .background(GraphqlConfTheme.colors.background),
  ) { target ->
    when (target) {
      MainHeaderContainerState.Title -> titleContent()
      MainHeaderContainerState.Search -> searchContent()
    }
  }
  HorizontalDivider(
    thickness = 1.dp,
    color = GraphqlConfTheme.colors.textDimmed,
  )
}


@Composable
fun MainHeaderTitleBar(
  title: String,
  modifier: Modifier = Modifier,
  startContent: @Composable RowScope.() -> Unit = {},
  endContent: @Composable RowScope.() -> Unit = {},
) {
  Box(
    modifier = modifier
      .height(48.dp)
      .fillMaxWidth()
      .background(GraphqlConfTheme.colors.surface),
    contentAlignment = Alignment.Center,
  ) {
    Row(Modifier.align(Alignment.CenterStart)) {
      startContent()
    }
    Text(
      text = title,
      modifier = Modifier.align(Alignment.Center).semantics { heading() },
      style = GraphqlConfTheme.typography.h3,
      color = GraphqlConfTheme.colors.text,
    )
    Row(Modifier.align(Alignment.CenterEnd)) {
      endContent()
    }
  }
}
