package graphqlconf.app.screen

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.design.component.TopMenuButton
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.arrow_left
import graphqlconf_app.app.generated.resources.floor_plan
import kotlinx.serialization.json.Json
import org.jetbrains.compose.resources.stringResource

private val json = Json { ignoreUnknownKeys = true }

@Composable
fun FloorPlanScreen(onBack: () -> Unit) {
  Column {
    Header(
      state = MainHeaderContainerState.Title,
      titleContent = {
        MainHeaderTitleBar(
          title = stringResource(Res.string.floor_plan),
          startContent = {
            TopMenuButton(
              icon = Res.drawable.arrow_left,
              onClick = onBack,
            )
          }
        )
      },
    )
    floorPlan()
  }
}


@Composable
expect fun floorPlan()