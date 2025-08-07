package graphqlconf.app

import android.app.Application
import androidx.preference.PreferenceManager
import com.russhwolf.settings.SharedPreferencesSettings

class MainApplication : Application() {
  override fun onCreate() {
    super.onCreate()
    initializeSettings(
      SharedPreferencesSettings(PreferenceManager.getDefaultSharedPreferences(this))
    )
  }
}
