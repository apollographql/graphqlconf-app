package graphqlconf.app

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Context.NOTIFICATION_SERVICE
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.*
import coil3.PlatformContext
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlin.time.Clock
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds
import kotlin.time.Instant
import kotlin.time.toJavaDuration

internal val notificationChannelId = "bookmarks"

fun Context.configureNotifications() {
  val name = getString(R.string.channel_name)
  val descriptionText = getString(R.string.channel_description)
  val importance = NotificationManager.IMPORTANCE_DEFAULT
  val mChannel = NotificationChannel(notificationChannelId, name, importance)
  mChannel.description = descriptionText
  val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
  notificationManager.createNotificationChannel(mChannel)
}

@OptIn(DelicateCoroutinesApi::class)
actual fun PlatformContext.askNotificationPermissionIfNeeded(onAllowed: () -> Unit) {
  check(this is MainActivity)

  if (Build.VERSION.SDK_INT >= 33) {
    val permission = Manifest.permission.POST_NOTIFICATIONS
    val granted = ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
    if (!granted) {
      launcher.launch(permission)
      GlobalScope.launch {
        permissionsAllowed.receive()
        onAllowed()
      }
    } else {
      onAllowed()
    }
  } else {
    onAllowed()
  }
}

private const val EXTRA_SESSION_ID = "sessionId"


actual fun PlatformContext.scheduleNotification(sessionId: String, scheduleAt: Instant, title: String, room: String) {
  askNotificationPermissionIfNeeded {
    val delay = (scheduleAt - Clock.System.now())
    if (delay.isNegative()) {
      // do not schedule in the past
      return@askNotificationPermissionIfNeeded
    }
    val data = Data.Builder()
      .putString("sessionId", sessionId)
      .putString("title", title)
      .putString("room", room)
      .build()

    val request = OneTimeWorkRequestBuilder<NotifyWorker>()
      .setInputData(data)
      .setInitialDelay(delay.toJavaDuration())
      .addTag(sessionId)
      .build()

    WorkManager.getInstance(this).enqueue(request)
  }
}

class NotifyWorker(
  appContext: Context,
  params: WorkerParameters
) : CoroutineWorker(appContext, params) {
  private val context = appContext

  override suspend fun doWork(): Result {
    val sessionId = inputData.getString("sessionId") ?: return Result.failure()
    val title = inputData.getString("title") ?: return Result.failure()
    val room = inputData.getString("room") ?: return Result.failure()

    with(context) {
      val intent = Intent(this, MainActivity::class.java)
        .putExtra(EXTRA_SESSION_ID, sessionId)
        .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)

      val pendingIntent: PendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE)

      val notification = NotificationCompat.Builder(this, notificationChannelId)
        .setSmallIcon(R.drawable.graphql)
        .setContentTitle(getString(R.string.notification_title, title))
        .setContentText(getString(R.string.notification_description, room))
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
        .setContentIntent(pendingIntent)
        .setAutoCancel(true)
        .build()

      if (ActivityCompat.checkSelfPermission(
          this,
          Manifest.permission.POST_NOTIFICATIONS
        ) != PackageManager.PERMISSION_GRANTED
      ) {
        return Result.failure()
      }
      NotificationManagerCompat.from(this).notify(sessionId.hashCode(), notification)
      return Result.success()
    }
  }
}

actual fun PlatformContext.cancelNotification(sessionId: String) {
  WorkManager.getInstance(this).cancelAllWorkByTag(sessionId)
}