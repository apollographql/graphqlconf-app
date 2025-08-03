import com.gradleup.librarian.gradle.Librarian

plugins {
  id("org.jetbrains.kotlin.jvm")
  id("com.google.devtools.ksp")
  id("com.gradleup.compat.patrouille")
  id("com.gradleup.gratatouille")
}

Librarian.module(project)

dependencies {
  compileOnly(libs.kgp)
  compileOnly(libs.gradle.api)
}

gratatouille {
  codeGeneration()

  pluginMarker("apollo.compose")
}

