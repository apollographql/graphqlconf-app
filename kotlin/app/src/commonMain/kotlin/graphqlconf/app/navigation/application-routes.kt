package graphqlconf.app.navigation

import kotlinx.serialization.Serializable

@Serializable
data object MainScreen

@Serializable
data class SessionScreen(val id: String)

@Serializable
data class SpeakerScreen(val id: String)

@Serializable
data object LicensesScreen

@Serializable
data object FloorPlanScreen
