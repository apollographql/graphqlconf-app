package graphqlconf.app

import coil3.PlatformContext
import kotlin.time.Instant

actual fun PlatformContext.askNotificationPermissionIfNeeded(onAllowed: () -> Unit) {
  TODO()
}

actual fun PlatformContext.scheduleNotification(sessionId: String, scheduleAt: Instant, title: String, room: String) {
  TODO()
}

actual fun PlatformContext.cancelNotification(sessionId: String) {
  TODO()
}