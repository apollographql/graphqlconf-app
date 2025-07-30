package graphqlconf.design.theme

import androidx.compose.ui.graphics.Color
import graphqlconf.design.theme.ColorValues.black100
import graphqlconf.design.theme.ColorValues.black50
import graphqlconf.design.theme.ColorValues.white100
import graphqlconf.design.theme.ColorValues.white50

class Colors(
  val mainBackground: Color,

  val primaryText: Color,

  val strokeHalf: Color,
)

val GraphqlConfLightColors = Colors(
  mainBackground = Color(0xFFFAFCF4),
  primaryText = black100,
  strokeHalf = black50
)

val GraphqlConfDarkColors = Colors(
  mainBackground = Color(0xFF0E0F0B),
  primaryText = white100,
  strokeHalf = white50,
)
