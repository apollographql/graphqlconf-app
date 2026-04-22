package graphqlconf.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.preference.PreferenceManager
import com.russhwolf.settings.SharedPreferencesSettings

class MainApplication : Application() {
  override fun onCreate() {
    super.onCreate()
    initializeSettings(
      SharedPreferencesSettings(PreferenceManager.getDefaultSharedPreferences(this))
    )
    configureNotifications()
  }
}
