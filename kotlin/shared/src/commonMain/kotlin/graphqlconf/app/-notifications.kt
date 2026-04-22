package graphqlconf.app

import coil3.PlatformContext
import kotlin.time.Instant

expect fun PlatformContext.askNotificationPermissionIfNeeded(onAllowed: () -> Unit)
expect fun PlatformContext.scheduleNotification(sessionId: String, scheduleAt: Instant, title: String, room: String)
expect fun PlatformContext.cancelNotification(sessionId: String)