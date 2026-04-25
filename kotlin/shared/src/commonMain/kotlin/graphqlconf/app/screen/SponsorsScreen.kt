package graphqlconf.app.screen

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.app.misc.SponsorList
import graphqlconf_app.shared.generated.resources.Res
import graphqlconf_app.shared.generated.resources.sponsors
import org.jetbrains.compose.resources.stringResource

@Composable
fun SponsorsScreen() {
  Column {
    Header(
      state = MainHeaderContainerState.Title,
      titleContent = {
        MainHeaderTitleBar(
          title = stringResource(Res.string.sponsors),
        )
      },
    )

    SponsorList()
  }
}
