package graphqlconf.design.theme

import androidx.compose.ui.graphics.Color
import graphqlconf.design.theme.ColorValues.black100
import graphqlconf.design.theme.ColorValues.black50
import graphqlconf.design.theme.ColorValues.neutral100
import graphqlconf.design.theme.ColorValues.neutral900
import graphqlconf.design.theme.ColorValues.white100
import graphqlconf.design.theme.ColorValues.white50

class Colors(
  val background: Color,
  val surface: Color,
  val primaryText: Color,
  val strokeHalf: Color,
)

val GraphqlConfLightColors = Colors(
  background = neutral100,
  surface = white100,
  primaryText = black100,
  strokeHalf = black50,
)

val GraphqlConfDarkColors = Colors(
  background = neutral900,
  surface = black100,
  primaryText = white100,
  strokeHalf = white50,
)
