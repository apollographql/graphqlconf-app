package graphqlconf.design.component

import androidx.compose.animation.*
import androidx.compose.animation.core.Spring.DampingRatioNoBouncy
import androidx.compose.animation.core.Spring.StiffnessMediumLow
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf.design.theme.PreviewHelper
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.arrow_down
import graphqlconf_app.app.generated.resources.now
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.jetbrains.compose.ui.tooling.preview.Preview

enum class NowButtonState {
  /**
   * The current time is before what is displayed in the list
   */
  Before,
  Current,
  After,
}

@Composable
fun NowButton(
  state: NowButtonState,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  enabled: Boolean = state != NowButtonState.Current,
) {
  val active = state != NowButtonState.Current
  val textColor by animateColorAsState(
    if (active) ColorValues.white100
    else GraphqlConfTheme.colors.textDimmed,
    ColorSpringSpec,
  )
  val background by animateColorAsState(
    if (active) ColorValues.secondaryBase
    else GraphqlConfTheme.colors.surface,
    ColorSpringSpec,
  )


  Row(
    modifier = modifier
      .padding(8.dp)
      .border(1.dp, color = background)
      .background(background.copy(alpha = 0.3f))
      .padding(4.dp)
      .clickable(onClick = onClick, enabled = enabled),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.Center,
  ) {
    Text(
      text = stringResource(Res.string.now).uppercase(),
      style = GraphqlConfTheme.typography.badge.copy(fontSize = 14.sp),
      color = textColor,
    )

    AnimatedContent(
      targetState = state,
      transitionSpec = {
        (fadeIn() + expandHorizontally(clip = false, expandFrom = Alignment.Start)) togetherWith
          (fadeOut() + shrinkHorizontally(clip = false, shrinkTowards = Alignment.Start))
      },
      modifier = Modifier.height(16.dp)
    ) { targetState ->
      Spacer(Modifier.width(2.dp))
      Icon(
        painter = painterResource(Res.drawable.arrow_down),
        contentDescription = null,
        modifier = Modifier
          .size(16.dp)
          .alpha(if (targetState == NowButtonState.Current) 0f else 1f)
          .rotate(if (targetState == NowButtonState.Before) 0f else 180f),
        tint = textColor,
      )
    }
  }
}

internal val ColorSpringSpec = spring<Color>(DampingRatioNoBouncy, StiffnessMediumLow)

@Preview
@Composable
internal fun NowButtonPreview() {
  PreviewHelper {
    NowButton(NowButtonState.Before, {})
    NowButton(NowButtonState.Current, {})
    NowButton(NowButtonState.After, {})
  }
}
