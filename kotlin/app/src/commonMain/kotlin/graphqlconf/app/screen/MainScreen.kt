package graphqlconf.app.screen

import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import graphqlconf.app.navigation.FloorPlanScreen
import graphqlconf.app.navigation.InfoScreen
import graphqlconf.app.navigation.LicensesScreen
import graphqlconf.app.navigation.ScheduleScreen
import graphqlconf.app.navigation.SessionScreen
import graphqlconf.app.navigation.SpeakerScreen
import graphqlconf.app.navigation.SpeakersScreen
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.calendar_today
import graphqlconf_app.app.generated.resources.calendar_today_filled
import graphqlconf_app.app.generated.resources.info_box
import graphqlconf_app.app.generated.resources.info_box_filled
import graphqlconf_app.app.generated.resources.nav_destination_info
import graphqlconf_app.app.generated.resources.nav_destination_schedule
import graphqlconf_app.app.generated.resources.nav_destination_speakers
import graphqlconf_app.app.generated.resources.users
import graphqlconf_app.app.generated.resources.users_filled
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import kotlin.reflect.KClass

@Composable
fun MainScreen(rootNavController: NavHostController) {
  val nestedNavController = rememberNavController()
  Column {
    NavHost(
      nestedNavController,
      startDestination = ScheduleScreen(false),
      modifier = Modifier.fillMaxWidth().weight(1.0f),
      enterTransition = { EnterTransition.None },
      exitTransition = { ExitTransition.None },
      popEnterTransition = { EnterTransition.None },
      popExitTransition = { ExitTransition.None },
    ) {
      composable<ScheduleScreen> {
        ScheduleScreen(
          isBookmarks = it.toRoute<ScheduleScreen>().isBookmarks,
          onSession = { rootNavController.navigate(SessionScreen(it)) }
        )
      }
      composable<SpeakersScreen> {
        SpeakersScreen(
          onSpeaker = { rootNavController.navigate(SpeakerScreen(it)) }
        )
      }
      composable<InfoScreen> {
        InfoScreen(
          navigateToLicenses = {
            rootNavController.navigate(LicensesScreen)
          },
          navigateToFloorPlan = {
            rootNavController.navigate(FloorPlanScreen)
          }
        )
      }
    }
    BottomNavigation(nestedNavController)
  }
}

data class MainNavDestination(
  val label: String,
  val icon: DrawableResource,
  val route: Any,
  val iconSelected: DrawableResource = icon,
  val routeClass: KClass<*>? = null,
)

@Composable
private fun BottomNavigation(nestedNavController: NavHostController) {
  val bottomNavDestinations: List<MainNavDestination> =
    listOf(
      MainNavDestination(
        label = stringResource(Res.string.nav_destination_schedule),
        icon = Res.drawable.calendar_today,
        iconSelected = Res.drawable.calendar_today_filled,
        route = ScheduleScreen,
        routeClass = ScheduleScreen::class
      ),
      MainNavDestination(
        label = stringResource(Res.string.nav_destination_speakers),
        icon = Res.drawable.users,
        iconSelected = Res.drawable.users_filled,
        route = SpeakersScreen,
        routeClass = SpeakersScreen::class
      ),
      MainNavDestination(
        label = stringResource(Res.string.nav_destination_info),
        icon = Res.drawable.info_box,
        iconSelected = Res.drawable.info_box_filled,
        route = InfoScreen,
        routeClass = InfoScreen::class
      ),
    )

  val currentDestination = nestedNavController.currentBackStackEntryAsState().value?.destination
  val currentBottomNavDestination = currentDestination?.let {
    bottomNavDestinations.find { dest ->
      val routeClass = dest.routeClass
      routeClass != null && currentDestination.hasRoute(routeClass)
    }
  }

  HorizontalDivider(thickness = 1.dp)
  MainNavigation(
    currentDestination = currentBottomNavDestination,
    destinations = bottomNavDestinations,
    onSelect = {
      nestedNavController.navigate(it.route) {
        // Avoid stacking multiple copies of the main screens
        popUpTo(nestedNavController.graph.findStartDestination().route!!) {
          saveState = true
        }
        launchSingleTop = true
        restoreState = true
      }
    },
  )
}

@Composable
fun MainNavigation(
  currentDestination: MainNavDestination?,
  destinations: List<MainNavDestination>,
  onSelect: (MainNavDestination) -> Unit,
  modifier: Modifier = Modifier,
) {
  Row(
    modifier = modifier.fillMaxWidth().padding(horizontal = 4.dp).background(GraphqlConfTheme.colors.surface),
    horizontalArrangement = Arrangement.spacedBy(8.dp)
  ) {
    destinations.forEach { destination ->
      MainNavigationButton(
        iconResource = destination.icon,
        iconFilledResource = destination.iconSelected,
        contentDescription = destination.label,
        selected = destination == currentDestination,
        onClick = { onSelect(destination) },
        modifier = Modifier.weight(1f),
      )
    }
  }
}

private val MainNavigationButtonShape = RoundedCornerShape(8.dp)

@Composable
private fun MainNavigationButton(
  iconResource: DrawableResource,
  iconFilledResource: DrawableResource,
  contentDescription: String,
  selected: Boolean,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
) {
  val iconColor by animateColorAsState(
    if (selected) GraphqlConfTheme.colors.text
    else GraphqlConfTheme.colors.text
  )
  Icon(
    modifier = modifier
      .clip(MainNavigationButtonShape)
      .selectable(
        selected = selected,
        enabled = true,
        role = Role.Tab,
        onClick = onClick,
      )
      .padding(10.dp)
      .size(28.dp),
    painter = painterResource(if (selected) iconFilledResource else iconResource),
    contentDescription = contentDescription,
    tint = iconColor,
  )
}