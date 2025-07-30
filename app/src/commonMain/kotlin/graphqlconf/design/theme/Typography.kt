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
  val h4: TextStyle,
  val text: TextStyle,
  val badge: TextStyle,
)

internal val GraphqlConfTypography: Typography
  @Composable
  get() {
    return Typography(
      h1 = TextStyle(
        fontFamily = HostGrotesk,
        fontWeight = FontWeight.SemiBold,
        fontSize = 30.sp,
        lineHeight = 32.sp,
      ),
      h2 = TextStyle(
        fontFamily = HostGrotesk,
        fontWeight = FontWeight.SemiBold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
      ),
      h3 = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontFamily = HostGrotesk,
        fontSize = 16.sp,
        lineHeight = 24.sp,
      ),
      h4 = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontFamily = HostGrotesk,
        fontSize = 13.sp,
        lineHeight = 20.sp,
      ),
      text = TextStyle(
        fontFamily = HostGrotesk,
        fontSize = 16.sp,
        lineHeight = 24.sp,
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
