package graphqlconf.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.LaunchedEffect
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import kotlinx.coroutines.channels.Channel

class MainActivity : ComponentActivity() {
  val permissionsAllowed = Channel<Unit>(Channel.UNLIMITED)
  val launcher = registerForActivityResult(ActivityResultContracts.RequestPermission()) {
    if (it) {
      permissionsAllowed.trySend(Unit)
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    installSplashScreen()

    setContent {
      LaunchedEffect(isSystemInDarkTheme()) {
        enableEdgeToEdge()
      }
      App()
    }
  }

  override fun onStart() {
    super.onStart()
  }
}