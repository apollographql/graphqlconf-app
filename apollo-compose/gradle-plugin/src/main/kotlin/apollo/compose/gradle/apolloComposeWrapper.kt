package apollo.compose.gradle

import gratatouille.wiring.GPlugin
import org.gradle.api.Project

@GPlugin(id = "apollo.compose")
fun apolloComposeWrapper(project: Project) {
  val supportedPlugins = listOf("org.jetbrain.kotlin.jvm", "org.jetbrain.kotlin.multiplatform")
  var hasKgp = false
  supportedPlugins.forEach {
    project.pluginManager.withPlugin(it) {
      if (hasKgp) {
        hasKgp = true
        project.pluginManager.apply(ApolloComposeGradlePlugin::class.java)
      }
    }
  }

  project.afterEvaluate {
    if (!hasKgp) {
      error("The apollo.compose Gradle plugin requires the Kotlin Gradle Plugin")
    }
  }
}