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

@Composable
fun App(isDarkTheme: Boolean = true) {
  Gallery()
//  MaterialTheme(
//    colors = if (isDarkTheme) darkColors() else lightColors()
//  ) {
//    Surface(
//      modifier = Modifier.fillMaxSize(),
//      color = MaterialTheme.colors.background
//    ) {
//      Column {
//        Text("Hello World!")
//        Text("Tada!")
//      }
//    }
//  }
}
