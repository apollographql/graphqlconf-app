package graphqlconf.app.navigation

import kotlinx.serialization.Serializable

@Serializable
class ScheduleScreen(val isBookmarks: Boolean)

@Serializable
data object SpeakersScreen

@Serializable
data object InfoScreen
