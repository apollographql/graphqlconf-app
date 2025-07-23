import gratatouille.gradle.GratatouilleExtension

plugins {
  id("base")
  id("java-gradle-plugin")
}

buildscript {
  dependencies {
    classpath(libs.kgp)
    classpath(libs.gratatouille)
    classpath(libs.ksp)
  }
}
group = "build-logic"

apply(plugin = "org.jetbrains.kotlin.jvm")
apply(plugin = "com.gradleup.gratatouille")
apply(plugin = "com.google.devtools.ksp")

dependencies {
  add("implementation", libs.kgp)
  add("implementation", libs.kotlinx.serialization)
  add("implementation", libs.ksp)
  add("implementation", libs.apollo.kotlin.execution.gradle.plugin)
  add("implementation", libs.okhttp)
}

extensions.getByType(GratatouilleExtension::class.java).apply {
  codeGeneration()
}

gradlePlugin {
  plugins {
    // Make it possible to use this project if it is an included build
    create("build-logic") {
      id = "build-logic"
      implementationClass = "Unused"
    }
  }
}