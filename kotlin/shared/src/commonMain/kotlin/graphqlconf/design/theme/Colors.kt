package graphqlconf.design.theme

import androidx.compose.ui.graphics.Color
import graphqlconf.design.theme.ColorValues.black100
import graphqlconf.design.theme.ColorValues.black50
import graphqlconf.design.theme.ColorValues.neutral100
import graphqlconf.design.theme.ColorValues.neutral900
import graphqlconf.design.theme.ColorValues.secondaryDarker
import graphqlconf.design.theme.ColorValues.secondaryLight
import graphqlconf.design.theme.ColorValues.white100
import graphqlconf.design.theme.ColorValues.white50

class Colors(
  /**
   * Background color for the whole screen.
   */
  val background: Color,
  /**
   * Color for cards, slightly different from `background`.
   */
  val surface: Color,
  /**
   * Main text color.
   */
  val text: Color,
  /**
   * Semi-transparent text.
   * May also be used for borders, dividers, etc.
   */
  val textDimmed: Color,
  /**
   * The secondary color when used on `background`.
   * Use for text/icons or other things that need to stand out against the background.
   */
  val secondary: Color,
  /**
   * A dimmed version of `secondary`. Used for separators, etc.
   */
  val secondaryDimmed: Color,
)

val GraphqlConfLightColors = Colors(
  background = neutral100,
  surface = white100,
  text = black100,
  textDimmed = black50,
  secondary = secondaryDarker,
  secondaryDimmed = secondaryLight,
)

val GraphqlConfDarkColors = Colors(
  background = neutral900,
  surface = black100,
  text = white100,
  textDimmed = white50,
  secondary = secondaryLight,
  secondaryDimmed = secondaryDarker,
)
