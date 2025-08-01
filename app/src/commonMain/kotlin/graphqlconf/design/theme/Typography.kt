package graphqlconf.design.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.unit.sp
import graphqlconf_app.app.generated.resources.CommitMono_400_Italic
import graphqlconf_app.app.generated.resources.CommitMono_400_Regular
import graphqlconf_app.app.generated.resources.CommitMono_700_Italic
import graphqlconf_app.app.generated.resources.CommitMono_700_Regular
import graphqlconf_app.app.generated.resources.HostGrotesk_Italic
import graphqlconf_app.app.generated.resources.HostGrotesk_Normal
import graphqlconf_app.app.generated.resources.Res
import org.jetbrains.compose.resources.Font

class Typography(
  val h1: TextStyle,
  val h2: TextStyle,
  val h3: TextStyle,
  val bodyLarge: TextStyle,
  val bodyMedium: TextStyle,
  val bodySmall: TextStyle,
  val badge: TextStyle,
)

internal val GraphqlConfTypography: Typography
  @Composable
  get() {
    return Typography(
      h1 = TextStyle(
        fontFamily = HostGrotesk,
        fontWeight = FontWeight.Normal,
        fontSize = 40.sp,
        lineHeight = 48.sp,
      ),
      h2 = TextStyle(
        fontFamily = HostGrotesk,
        fontWeight = FontWeight.Normal,
        fontSize = 32.sp,
        lineHeight = 38.sp,
      ),
      h3 = TextStyle(
        fontWeight = FontWeight.Normal,
        fontFamily = HostGrotesk,
        fontSize = 24.sp,
        lineHeight = 28.sp,
      ),
      bodyLarge = TextStyle(
        fontFamily = HostGrotesk,
        fontSize = 16.sp,
        lineHeight = 24.sp,
      ),
      bodyMedium = TextStyle(
        fontFamily = HostGrotesk,
        fontSize = 14.sp,
        lineHeight = 21.sp,
      ),
      bodySmall = TextStyle(
        fontFamily = HostGrotesk,
        fontSize = 12.sp,
        lineHeight = 18.sp,
      ),
      badge = TextStyle(
        fontFamily = CommitMono,
        fontSize = 16.sp,
        lineHeight = 24.sp,
      )
    )
  }


internal val CommitMono: FontFamily
  @Composable
  get() = FontFamily(
    Font(Res.font.CommitMono_400_Regular, FontWeight.Normal, FontStyle.Normal),
    Font(Res.font.CommitMono_700_Regular, FontWeight.Bold, FontStyle.Normal),
    Font(Res.font.CommitMono_400_Italic, FontWeight.Normal, FontStyle.Italic),
    Font(Res.font.CommitMono_700_Italic, FontWeight.Bold, FontStyle.Italic),
  )

internal val HostGrotesk: FontFamily
  @Composable
  get() = FontFamily(
    Font(
      Res.font.HostGrotesk_Normal,
      FontWeight.Normal,
      FontStyle.Normal,
      variationSettings = FontVariation.Settings(FontVariation.weight(400))
    ),
    Font(
      Res.font.HostGrotesk_Normal,
      FontWeight.SemiBold,
      FontStyle.Normal,
      variationSettings = FontVariation.Settings(FontVariation.weight(600))
    ),
    Font(
      Res.font.HostGrotesk_Normal,
      FontWeight.Bold,
      FontStyle.Normal,
      variationSettings = FontVariation.Settings(FontVariation.weight(700))
    ),
    Font(
      Res.font.HostGrotesk_Italic,
      FontWeight.Normal,
      FontStyle.Italic,
      variationSettings = FontVariation.Settings(FontVariation.weight(400))
    ),
    Font(
      Res.font.HostGrotesk_Italic,
      FontWeight.SemiBold,
      FontStyle.Italic,
      variationSettings = FontVariation.Settings(FontVariation.weight(600))
    ),
    Font(
      Res.font.HostGrotesk_Italic,
      FontWeight.Bold,
      FontStyle.Italic,
      variationSettings = FontVariation.Settings(FontVariation.weight(700))
    ),
  )
