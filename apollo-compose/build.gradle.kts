import com.gradleup.librarian.gradle.Librarian

plugins {
  id("base")
}

buildscript {
  dependencies {
    classpath("apollo.compose:build-logic")
  }
}

Librarian.root(project)