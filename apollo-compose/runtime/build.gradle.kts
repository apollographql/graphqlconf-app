import com.gradleup.librarian.gradle.Librarian

plugins {
  id("org.jetbrains.kotlin.multiplatform")
  id("org.jetbrains.kotlin.plugin.compose")
}

Librarian.module(project)

kotlin {
  jvm()
  sourceSets {
    getByName("commonMain").dependencies {
      implementation(libs.compose.runtime)
    }
  }
}