package graphqlconf.app.screen

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import me.saket.telephoto.zoomable.coil3.ZoomableAsyncImage

@Composable
actual fun floorPlan() {
  ZoomableAsyncImage(
    modifier = Modifier.fillMaxSize(),
    model = "https://storage.googleapis.com/martin-public/floor_plan.png",
    contentDescription = "…",
  )
}