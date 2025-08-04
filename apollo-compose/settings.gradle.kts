pluginManagement {
  listOf(repositories, dependencyResolutionManagement.repositories).forEach {
    it.mavenCentral()
    it.google()
    it.maven("https://storage.googleapis.com/gradleup/m2/")
  }
}

include(":compiler-plugin", "runtime", "gradle-plugin")
includeBuild("build-logic")