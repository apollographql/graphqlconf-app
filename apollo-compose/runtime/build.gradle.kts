import com.gradleup.librarian.gradle.Librarian

plugins {
  id("org.jetbrains.kotlin.jvm")
  id("com.gradleup.compat.patrouille")
}

Librarian.module(project)

