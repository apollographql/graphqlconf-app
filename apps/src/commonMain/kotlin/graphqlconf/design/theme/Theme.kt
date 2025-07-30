package graphqlconf.design.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.compositionLocalOf

val LocalColors = compositionLocalOf<Colors> {
  error("GraphqlConfTheme must be part of the call hierarchy to provide colors")
}

val LocalTypography = compositionLocalOf<Typography> {
  error("GraphqlConfTheme must be part of the call hierarchy to provide typography")
}

object GraphqlConfTheme {
  val colors: Colors
    @Composable
    @ReadOnlyComposable
    get() = LocalColors.current

  val typography: Typography
    @Composable
    @ReadOnlyComposable
    get() = LocalTypography.current
}

@Composable
fun GraphqlConfTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  content: @Composable () -> Unit,
) {
  CompositionLocalProvider(
    LocalColors provides if (darkTheme) GraphqlConfDarkColors else GraphqlConfLightColors,
    LocalTypography provides GraphqlConfTypography,
  ) {
    content()
  }
}