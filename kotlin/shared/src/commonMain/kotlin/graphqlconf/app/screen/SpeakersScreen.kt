package graphqlconf.app.screen

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.app.misc.SpeakerList
import graphqlconf.design.component.TopMenuButton
import graphqlconf_app.shared.generated.resources.Res
import graphqlconf_app.shared.generated.resources.nav_destination_speakers
import graphqlconf_app.shared.generated.resources.search
import org.jetbrains.compose.resources.stringResource

@Composable
fun SpeakersScreen(
  onSpeaker: (String) -> Unit,
  onSearch: () -> Unit,
) {
  Column {

    Header(
      state = MainHeaderContainerState.Title,
      titleContent = {
        MainHeaderTitleBar(
          title = stringResource(Res.string.nav_destination_speakers),
          endContent = {
            TopMenuButton(
              icon = Res.drawable.search,
              onClick = onSearch,
            )
          },
        )
      },
    )

    SpeakerList(onSpeaker)
  }
}