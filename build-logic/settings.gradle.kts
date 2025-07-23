pluginManagement {
  listOf(repositories, dependencyResolutionManagement.repositories).forEach {
    it.mavenCentral()
    it.maven("https://storage.googleapis.com/apollo-snapshots/m2/")
  }
}
