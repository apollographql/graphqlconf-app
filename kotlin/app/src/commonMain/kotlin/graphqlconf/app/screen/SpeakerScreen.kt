package graphqlconf.app.screen

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.design.component.TopMenuButton
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.arrow_left
import graphqlconf_app.app.generated.resources.back
import graphqlconf_app.app.generated.resources.nav_destination_speaker
import org.jetbrains.compose.resources.stringResource

@Composable
fun SpeakerScreen(onBack1: String, onBack: () -> Unit) {
  Column {
    Header(
      state = MainHeaderContainerState.Title,
      titleContent = {
        MainHeaderTitleBar(
          title = stringResource(Res.string.nav_destination_speaker),
          startContent = {
            TopMenuButton(
              icon = Res.drawable.arrow_left,
              contentDescription = stringResource(Res.string.back),
              onClick = onBack,
            )
          }
        )
      },
    )
  }
}
