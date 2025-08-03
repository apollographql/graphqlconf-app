plugins {
  id("base")
}

buildscript {
  dependencies {
    classpath("graphqlconf.app:build-logic")
    classpath("com.apollographql.compose:gradle-plugin")
  }
}