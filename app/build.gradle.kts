import org.jetbrains.compose.desktop.application.dsl.TargetFormat
import org.jetbrains.kotlin.compose.compiler.gradle.ComposeFeatureFlag

plugins {
  id("org.jetbrains.kotlin.multiplatform")
  id("org.jetbrains.kotlin.plugin.compose")
  id("org.jetbrains.compose")
  id("org.jetbrains.compose.hot-reload")
  id("com.gradleup.compat.patrouille")
  id("apollo.compose")
}

compatPatrouille {
  java(17)
}

kotlin {
  jvm()
  sourceSets {
    getByName("commonMain").dependencies {
      implementation("com.apollographql.compose:runtime")

      implementation(compose.runtime)
      implementation(compose.foundation)
      implementation(compose.material3)
      implementation(compose.components.resources)

      implementation(libs.kotlinx.datetime)
      implementation(libs.kotlinx.coroutines.core)
      implementation(libs.androidx.lifecycle.runtime.compose)

      implementation(libs.components.ui.tooling.preview)
    }

    getByName("commonTest").dependencies {
      implementation(kotlin("test"))
    }

    getByName("jvmMain").dependencies {
      implementation(compose.desktop.currentOs)
      implementation(compose.desktop.common)

      implementation(libs.kotlinx.coroutines.swing)
    }

    getByName("jvmTest").dependencies {
      implementation(compose.desktop.currentOs)
      implementation(compose.desktop.uiTestJUnit4)
    }
  }
}

apolloCompose {
  schemaFile.set(file("../backend/graphql/schema.graphqls"))
}

compose.desktop {
  application {
    mainClass = "graphqlconf.MainKt"

    nativeDistributions {
      targetFormats(TargetFormat.Dmg, TargetFormat.Deb)
      packageName = "GraphQLConf"
      packageVersion = "1.0.0"

      val iconsRoot = project.file("desktop-icons")
      macOS {
        iconFile.set(iconsRoot.resolve("icon-mac.icns"))
      }
      linux {
        iconFile.set(iconsRoot.resolve("icon-linux.png"))
      }
    }

    buildTypes.release.proguard {
      configurationFiles.from(project.file("rules.pro"))
    }
  }
}

composeCompiler {
  featureFlags.add(ComposeFeatureFlag.OptimizeNonSkippingGroups)
}

compose.resources {
  publicResClass = true
  nameOfResClass = "Res"
}
