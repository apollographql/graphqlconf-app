package graphqlconf.app

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import graphqlconf.app.navigation.MainScreen
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
        color = GraphqlConfTheme.colors.background
      ) {
        val navController = rememberNavController()
        NavHost(
          navController = navController,
          startDestination = MainScreen,
        ) {
          composable<MainScreen> {
            graphqlconf.app.screen.MainScreen()
          }
        }
      }
    }
  }
}
