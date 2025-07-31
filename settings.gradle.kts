pluginManagement {
  listOf(repositories, dependencyResolutionManagement.repositories).forEach {
    it.mavenCentral()
    it.maven("https://storage.googleapis.com/apollo-snapshots/m2/")
    it.maven("https://storage.googleapis.com/gradleup/m2/")
    it.maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
    it.gradlePluginPortal()
    it.google()
  }
  includeBuild("build-logic")
}

plugins {
  id("build-logic").apply(false)
  id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0")
}

include(":backend", ":app")
includeBuild("apollo-compose")

