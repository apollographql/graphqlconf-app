package graphqlconf.app

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import graphqlconf.app.navigation.FloorPlanScreen
import graphqlconf.app.navigation.InfoScreen
import graphqlconf.app.navigation.LicensesScreen
import graphqlconf.app.navigation.MainScreen
import graphqlconf.app.navigation.SessionScreen
import graphqlconf.app.navigation.SpeakerScreen
import graphqlconf.app.screen.FloorPlanScreen
import graphqlconf.app.screen.LicensesScreen
import graphqlconf.app.screen.MainScreen
import graphqlconf.app.screen.SessionScreen
import graphqlconf.app.screen.SpeakerScreen
import graphqlconf.design.theme.GraphqlConfTheme

@Composable
fun App() {
  GraphqlConfTheme {
    Box(
      modifier = Modifier
        .background(GraphqlConfTheme.colors.surface)
        .windowInsetsPadding(WindowInsets.statusBars)
        .windowInsetsPadding(WindowInsets.navigationBars)
        .fillMaxSize(),
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
        composable<LicensesScreen> {
          LicensesScreen(onBack = navController::popBackStack)
        }
        composable<FloorPlanScreen> {
          FloorPlanScreen(onBack = navController::popBackStack)
        }
      }
    }
  }
}

