package graphqlconf.app

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
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
