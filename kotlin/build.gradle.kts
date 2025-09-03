plugins {
  id("base")
}

buildscript {
  dependencies {
    classpath("graphqlconf.app:build-logic")
  }
  configurations.all {
    resolutionStrategy.eachDependency {
      if (requested.group == "com.google.protobuf" && requested.name == "protobuf-java") {
        useVersion("3.25.8")
        because("https://issuetracker.google.com/issues/371158364#comment2")
      }
    }
  }
}

