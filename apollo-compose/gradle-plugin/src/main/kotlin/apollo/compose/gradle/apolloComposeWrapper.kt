package apollo.compose.gradle

import gratatouille.wiring.GPlugin
import org.gradle.api.Project

/**
 * A wrapper that is used to display a nice error message if Kotlin is not loaded
 * in the classpath.
 */
@GPlugin(id = "apollo.compose")
fun apolloComposeWrapper(project: Project) {
  val supportedPlugins = listOf("org.jetbrains.kotlin.jvm", "org.jetbrains.kotlin.multiplatform")
  var hasKgp = false
  supportedPlugins.forEach {
    project.pluginManager.withPlugin(it) {
      if (!hasKgp) {
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