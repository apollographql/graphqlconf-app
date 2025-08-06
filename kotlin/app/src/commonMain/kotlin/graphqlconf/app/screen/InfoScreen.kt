package graphqlconf.app.screen

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.runtime.Composable
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.app.misc.Schedule
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.nav_destination_speakers
import org.jetbrains.compose.resources.stringResource

@Composable
fun InfoScreen() {
  Column {
    val listState = rememberLazyListState()

    Header(
      state = MainHeaderContainerState.Title,
      titleContent = {
        MainHeaderTitleBar(
          title = stringResource(Res.string.nav_destination_speakers),
        )
      },
    )

    Schedule(listState)
  }
}