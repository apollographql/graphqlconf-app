pluginManagement {
  listOf(repositories, dependencyResolutionManagement.repositories).forEach {
    it.mavenCentral()
    it.maven("https://storage.googleapis.com/apollo-snapshots/m2/")
  }
  includeBuild("build-logic")
}

plugins {
  id("build-logic").apply(false)
}

include(":backend")

includeBuild("../apollo-kotlin-execution")