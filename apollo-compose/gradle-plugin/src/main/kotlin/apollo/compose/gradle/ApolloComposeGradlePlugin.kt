package apollo.compose.gradle

import org.gradle.api.provider.Provider
import org.jetbrains.kotlin.gradle.plugin.KotlinCompilation
import org.jetbrains.kotlin.gradle.plugin.KotlinCompilerPluginSupportPlugin
import org.jetbrains.kotlin.gradle.plugin.SubpluginArtifact
import org.jetbrains.kotlin.gradle.plugin.SubpluginOption

class ApolloComposeGradlePlugin: KotlinCompilerPluginSupportPlugin {
  override fun applyToCompilation(kotlinCompilation: KotlinCompilation<*>): Provider<List<SubpluginOption>> {
    val project = kotlinCompilation.target.project
    return project.provider {
      emptyList()
    }
  }

  override fun getCompilerPluginId(): String {
    return "apollo.compose"
  }

  override fun getPluginArtifact(): SubpluginArtifact {
    return SubpluginArtifact("com.apollographql.compose", "compiler-plugin")
  }

  override fun isApplicable(kotlinCompilation: KotlinCompilation<*>): Boolean {
    return true
  }
}