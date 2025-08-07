package graphqlconf.app

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import graphqlconf.app.navigation.MainScreen
import graphqlconf.app.navigation.SessionScreen
import graphqlconf.app.navigation.SpeakerScreen
import graphqlconf.app.screen.MainScreen
import graphqlconf.app.screen.SessionScreen
import graphqlconf.app.screen.SpeakerScreen
import graphqlconf.design.theme.GraphqlConfTheme

@Composable
fun App(isDarkTheme: Boolean = true) {
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
          MainScreen(navController)
        }
        composable<SessionScreen> {
          SessionScreen(
            id = it.toRoute<SessionScreen>().id,
            onBack = navController::popBackStack,
            onSpeaker = { navController.navigate(SpeakerScreen(it)) }
          )
        }
        composable<SpeakerScreen> {
          SpeakerScreen(
            id = it.toRoute<SpeakerScreen>().id,
            onSession = { navController.navigate(SessionScreen(it)) },
            onBack = navController::popBackStack
          )
        }
      }
    }
  }
}

