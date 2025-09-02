pluginManagement {
  listOf(repositories, dependencyResolutionManagement.repositories).forEach {
    it.mavenCentral()
    it.maven("https://storage.googleapis.com/apollo-snapshots/m2/")
    it.maven("https://storage.googleapis.com/gradleup/m2/")
    it.maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
    it.gradlePluginPortal()
    it.google()
    it.mavenLocal()
  }
}

plugins {
  id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0")
}

rootProject.name = "graphqlconf-app"

include(":backend", ":app")

includeBuild("build-logic")
