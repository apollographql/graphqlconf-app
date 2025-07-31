package graphqlconf.app

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.material.darkColors
import androidx.compose.material.lightColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import graphqlconf.design.catalog.Gallery
import graphqlconf.design.theme.GraphqlConfTheme

@Composable
fun App(isDarkTheme: Boolean = true) {
  if (false) {
    Gallery()
  } else {
    GraphqlConfTheme {
      Surface(
        modifier = Modifier.fillMaxSize(),
        color = GraphqlConfTheme.colors.mainBackground
      ) {
        SessionList()
      }
    }
  }
}
