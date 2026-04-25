package graphqlconf.design.component

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.FloatSpringSpec
import androidx.compose.animation.core.Spring.DampingRatioNoBouncy
import androidx.compose.animation.core.Spring.StiffnessMediumLow
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
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
import graphqlconf_app.shared.generated.resources.Res
import graphqlconf_app.shared.generated.resources.arrow_down
import graphqlconf_app.shared.generated.resources.now
import graphqlconf_app.shared.generated.resources.rewind
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource

sealed interface NowButtonState {
  val scrollIndex: Int
  class ScrollDown(override val scrollIndex: Int): NowButtonState
  class Disabled(override val scrollIndex: Int, val countdown: Int? = null): NowButtonState
  class ScrollUp(override val scrollIndex: Int, val rewind: Boolean = false): NowButtonState
}

@Composable
fun NowButton(
  state: NowButtonState,
  onClick: (Int) -> Unit,
  modifier: Modifier = Modifier,
) {
  val active = state !is NowButtonState.Disabled
  val textColor by animateColorAsState(
    if (active) GraphqlConfTheme.colors.text
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
      .clickable(onClick = {
        onClick(state.scrollIndex)
      }, enabled = active),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.Center,
  ) {
    val text = when  {
      state is NowButtonState.Disabled && state.countdown != null -> {
        "D - ${state.countdown}"
      }
      state is NowButtonState.ScrollUp && state.rewind -> {
        stringResource(Res.string.rewind)
      }
      else -> stringResource(Res.string.now)
    }
    Text(
      text = text,
      style = GraphqlConfTheme.typography.badge.copy(fontSize = 14.sp),
      color = textColor,
    )

    val alpha by animateFloatAsState(
      when(state) {
        is NowButtonState.ScrollDown,
        is NowButtonState.ScrollUp -> 1f
        else -> 0f
      },
      FloatSpringSpec(),
    )
    val rotation = when (state) {
      is NowButtonState.ScrollUp -> 180f
      else -> 0f
    }
    Spacer(Modifier.width(2.dp))
    Icon(
      painter = painterResource(Res.drawable.arrow_down),
      contentDescription = null,
      modifier = Modifier
        .size(16.dp)
        .alpha(alpha)
        .rotate(rotation),
      tint = textColor,
    )
  }
}

internal val ColorSpringSpec = spring<Color>(DampingRatioNoBouncy, StiffnessMediumLow)
