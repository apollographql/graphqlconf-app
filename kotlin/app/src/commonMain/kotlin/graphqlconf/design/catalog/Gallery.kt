package graphqlconf.design.catalog

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Slider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import graphqlconf.design.component.SessionCardPreview
import graphqlconf.design.component.SpeakerCardPreview


@Composable
fun Gallery() {
  var densityFloat by remember { mutableStateOf(2f) }
  Column {
    Slider(densityFloat, onValueChange = { densityFloat = it }, valueRange = 0.5f..6f)

    CompositionLocalProvider(LocalDensity provides Density(densityFloat)) {
      Column(Modifier.verticalScroll(rememberScrollState())) {
        SessionCardPreview()
        SpeakerCardPreview()
      }
    }
  }
}