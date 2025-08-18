package graphqlconf.app.screen

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import graphqlconf.app.misc.Artifact
import graphqlconf.app.misc.Header
import graphqlconf.app.misc.MainHeaderContainerState
import graphqlconf.app.misc.MainHeaderTitleBar
import graphqlconf.design.component.TopMenuButton
import graphqlconf.design.theme.CommitMono
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.arrow_left
import graphqlconf_app.app.generated.resources.nav_licenses
import kotlinx.serialization.json.Json
import org.jetbrains.compose.resources.stringResource

private val json = Json { ignoreUnknownKeys = true }

@Composable
fun LicensesScreen(onBack: () -> Unit) {
  Column {
    Header(
      state = MainHeaderContainerState.Title,
      titleContent = {
        MainHeaderTitleBar(
          title = stringResource(Res.string.nav_licenses),
          startContent = {
            TopMenuButton(
              icon = Res.drawable.arrow_left,
              onClick = onBack,
            )
          }
        )
      },
    )

    val artifacts = remember { mutableStateOf<List<Artifact>?>(null) }

    LaunchedEffect(true) {
      artifacts.value = json.decodeFromString<List<Artifact>>(String(Res.readBytes("files/artifacts.json")))
    }

    when (val artifactsValue = artifacts.value) {
      null -> {
        Box {
          Text(
            text = "Licenses not found",
            color = GraphqlConfTheme.colors.text,
            style = GraphqlConfTheme.typography.h2,
            modifier = Modifier.align(Alignment.Center)
          )
        }
      }

      else -> {
        Column(
          modifier = Modifier
            .fillMaxSize()
        ) {
          Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
            artifactsValue.forEach { artifact ->
              val license = (artifact.spdxLicenses + artifact.unknownLicenses).single()
              val uriHandler = LocalUriHandler.current

              Column(modifier = Modifier
                .clickable(onClick = {
                  uriHandler.openUri(license.url)
                })
                .fillMaxWidth()) {
                Text(
                  text = "${artifact.groupId}:${artifact.artifactId}:${artifact.version}",
                  color = GraphqlConfTheme.colors.text,
                  fontSize = 14.sp,
                  fontFamily = CommitMono,
                  fontWeight = FontWeight.SemiBold,
                  modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )

                Text(
                  text = license.identifier ?: license.name!!,
                  color = GraphqlConfTheme.colors.text,
                  style = GraphqlConfTheme.typography.bodySmall,
                  modifier = Modifier
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                )
              }
              HorizontalDivider(
                thickness = 1.dp,
                color = GraphqlConfTheme.colors.textDimmed,
                modifier = Modifier.padding(vertical = 8.dp)
              )
            }
          }
        }
      }
    }
  }
}
